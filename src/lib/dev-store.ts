export interface DevEnquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  service: string;
  message: string;
  status: "new" | "contacted" | "closed";
  email_status: "pending" | "sending" | "sent" | "failed" | "unconfigured";
  consent: boolean;
}

class DevEnquiryStore {
  private enquiries: DevEnquiry[] = [];

  getAll(status?: string, page = 1, pageSize = 20) {
    let filtered = [...this.enquiries];
    if (status && status !== "all") {
      filtered = filtered.filter((e) => e.status === status);
    }
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);
    return {
      data: paginated,
      count: filtered.length,
      error: null,
    };
  }

  getById(id: string) {
    const item = this.enquiries.find((e) => e.id === id);
    return {
      data: item || null,
      error: item ? null : new Error("Not found"),
    };
  }

  updateStatus(id: string, status: "new" | "contacted" | "closed") {
    const item = this.enquiries.find((e) => e.id === id);
    if (!item) return { data: null, error: new Error("Not found") };
    item.status = status;
    return { data: { id: item.id }, error: null };
  }

  addEnquiry(payload: {
    name: string;
    email: string;
    phone?: string;
    institution?: string;
    service: string;
    message: string;
    consent: boolean;
  }) {
    const id = crypto.randomUUID();
    const newEnquiry: DevEnquiry = {
      id,
      created_at: new Date().toISOString(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone || "",
      institution: payload.institution || "",
      service: payload.service,
      message: payload.message,
      status: "new",
      email_status: "unconfigured",
      consent: payload.consent,
    };
    this.enquiries.unshift(newEnquiry);
    return { id, duplicate: false };
  }
}

// Global singleton to persist state across dev hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __chemizen_empty_dev_store__: DevEnquiryStore | undefined;
}

export const devStore =
  globalThis.__chemizen_empty_dev_store__ ||
  (globalThis.__chemizen_empty_dev_store__ = new DevEnquiryStore());

export function createDevClient() {
  return {
    from: (table: string) => {
      if (table !== "enquiries") {
        throw new Error(`Unsupported dev table: ${table}`);
      }
      return {
        select: (
          _fields?: string,
          options?: { count?: "exact" | "planned" | "estimated" },
        ) => {
          let currentStatus = "all";
          let currentPage = 1;
          const pageSize = 20;

          const queryObj = {
            order: (_field: string, _opts?: { ascending?: boolean }) =>
              queryObj,
            range: (from: number, to: number) => {
              currentPage = Math.floor(from / pageSize) + 1;
              return queryObj;
            },
            eq: (field: string, val: string) => {
              if (field === "status") {
                currentStatus = val;
                return queryObj;
              }
              if (field === "id") {
                return {
                  maybeSingle: async () => {
                    const res = devStore.getById(val);
                    return { data: res.data, error: null };
                  },
                };
              }
              return queryObj;
            },
            maybeSingle: async () => {
              const res = devStore.getAll();
              return { data: res.data[0] || null, error: null };
            },
            then: (
              resolve: (val: {
                data: DevEnquiry[];
                error: null;
                count: number;
              }) => void,
            ) => {
              const res = devStore.getAll(currentStatus, currentPage, pageSize);
              resolve({
                data: res.data,
                error: null,
                count: options?.count ? res.count : res.data.length,
              });
            },
          };
          return queryObj;
        },
        update: (values: { status: "new" | "contacted" | "closed" }) => {
          return {
            eq: (field: string, id: string) => {
              if (field !== "id") throw new Error("Only eq('id') supported");
              return {
                select: (_f?: string) => ({
                  maybeSingle: async () => {
                    const res = devStore.updateStatus(id, values.status);
                    return { data: res.data, error: res.error };
                  },
                }),
              };
            },
          };
        },
      };
    },
  };
}
