import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  ReviewError,
  type ModeratedReview,
  type ReviewInput,
  type ReviewStatus,
} from "./review-schema";

type Record = ModeratedReview & { token: string; hash: string };
type Data = {
  reviews: Record[];
  limits: { key: string; at: number }[];
  votes: { id: string; voter: string }[];
};
declare global {
  var __chemizenReviewQueues: Map<string, Promise<unknown>> | undefined;
}
// Keep coordination data across reloads, never instances containing old module code.
const queues = (globalThis.__chemizenReviewQueues ??= new Map());
/** Local development only. Atomic writes preserve moderation across server restarts. */
export class LocalReviews {
  constructor(
    private path: string,
    private submissionLimit = 3,
    private reactionLimit = 30,
  ) {}
  private async read(): Promise<Data> {
    try {
      const data = JSON.parse(await readFile(this.path, "utf8")) as Data;
      // Older local stores may predate reactions. Preserve their existing reviews.
      data.votes ??= [];
      data.limits ??= [];
      return data;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT")
        return { reviews: [], limits: [], votes: [] };
      throw e;
    }
  }
  private mutate<T>(action: (data: Data) => T): Promise<T> {
    const work = (queues.get(this.path) ?? Promise.resolve()).then(async () => {
      const data = await this.read();
      const result = action(data);
      await mkdir(dirname(this.path), { recursive: true });
      const temporary = `${this.path}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify(data), { mode: 0o600 });
      await rename(temporary, this.path);
      return result;
    });
    queues.set(
      this.path,
      work.catch(() => {}),
    );
    return work;
  }
  async list(
    status: ReviewStatus,
    page = 1,
    limit = 12,
    top = false,
    minRating = 1,
  ) {
    await queues.get(this.path);
    const { reviews } = await this.read();
    const matches = reviews
      .filter((r) => r.status === status && r.rating >= minRating)
      .sort(
        (a, b) =>
          (top ? b.rating - a.rating : 0) ||
          b.created_at.localeCompare(a.created_at),
      );
    const rows = matches
      .slice((page - 1) * limit, page * limit)
      .map(({ token, hash, ...r }) => {
        void token;
        void hash;
        return r;
      });
    return { rows, count: matches.length };
  }
  submit(input: ReviewInput, hash: string, key: string) {
    return this.mutate((data) => {
      const existing = data.reviews.find(
        (r) => r.token === input.submissionToken,
      );
      if (existing) {
        if (existing.hash !== hash)
          throw new ReviewError(
            409,
            "This review was already submitted with different content. Reopen the form to write a new review.",
          );
        return { id: existing.id, duplicate: true };
      }
      const now = Date.now();
      data.limits = data.limits.filter((l) => now - l.at < 3600000);
      if (
        data.limits.filter((l) => l.key === key).length >= this.submissionLimit
      )
        throw new ReviewError(
          429,
          "Too many reviews. Please try again in an hour.",
        );
      const id = randomUUID();
      data.reviews.push({
        id,
        name: input.name,
        rating: input.rating,
        text: input.text,
        status: "pending",
        created_at: new Date().toISOString(),
        helpful_count: 0,
        token: input.submissionToken,
        hash,
      });
      data.limits.push({ key, at: now });
      return { id, duplicate: false };
    });
  }
  moderate(id: string, status: ReviewStatus) {
    return this.mutate((data) => {
      const record = data.reviews.find((r) => r.id === id);
      if (!record) throw new ReviewError(404, "Review not found.");
      record.status = status;
      return { id };
    });
  }
  helpful(id: string, voter: string, liked: boolean, key: string) {
    return this.mutate((data) => {
      const record = data.reviews.find(
        (r) => r.id === id && r.status === "approved",
      );
      if (!record) throw new ReviewError(404, "Review not found.");
      const now = Date.now();
      data.limits = data.limits.filter((l) => now - l.at < 3600000);
      if (data.limits.filter((l) => l.key === key).length >= this.reactionLimit)
        throw new ReviewError(
          429,
          "Too many requests. Please try again later.",
        );
      data.limits.push({ key, at: now });
      const found = data.votes.find((v) => v.id === id && v.voter === voter);
      if (liked && !found) {
        data.votes.push({ id, voter });
        record.helpful_count++;
      }
      if (!liked && found) {
        data.votes = data.votes.filter((v) => v !== found);
        record.helpful_count--;
      }
      return { liked, count: record.helpful_count };
    });
  }
}
// Production uses PostgreSQL's independent, stricter limits.
export const localReviews = new LocalReviews(
  join(process.cwd(), ".local", "reviews.json"),
  100,
  300,
);
