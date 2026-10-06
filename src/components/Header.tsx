"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./Brand";
const links = [
  ["Workshops", "/workshops"],
  ["Services", "/services"],
  ["Journal", "/journal"],
  ["Guides", "/insights"],
  ["About", "/about"],
];
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null);
  const nav = useRef<HTMLElement>(null);
  const glass = useRef<HTMLSpanElement>(null);
  const [overHero, setOverHero] = useState(path === "/");

  function moveGlass(link: HTMLAnchorElement | null) {
    if (!nav.current || !glass.current) return;
    if (!link) {
      glass.current.dataset.visible = "false";
      return;
    }
    const bounds = nav.current.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    glass.current.style.width = `${item.width}px`;
    glass.current.style.height = `${item.height}px`;
    glass.current.style.transform = `translate3d(${item.left - bounds.left}px, ${item.top - bounds.top}px, 0)`;
    glass.current.dataset.visible = "true";
  }
  function restoreGlass() {
    moveGlass(
      nav.current?.querySelector<HTMLAnchorElement>('a[aria-current="page"]') ||
        null,
    );
  }
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const hero = document.querySelector(".hero");
      const bottom = header.current?.getBoundingClientRect().bottom || 100;
      setOverHero(
        path === "/" && !!hero && hero.getBoundingClientRect().bottom > bottom,
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [path]);
  useEffect(() => {
    const navigation = nav.current;
    if (!navigation) return;
    const restore = () =>
      moveGlass(
        navigation.querySelector<HTMLAnchorElement>('a[aria-current="page"]'),
      );
    const observer = new ResizeObserver(restore);
    observer.observe(navigation);
    restore();
    return () => observer.disconnect();
  }, [path]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1001px)");
    const close = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
      if (e.key === "Tab") {
        const items = [
          button.current,
          ...Array.from(
            panel.current?.querySelectorAll<HTMLAnchorElement>("a") || [],
          ),
        ].filter(Boolean) as HTMLElement[];
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prior;
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        ref={header}
        className="header"
        data-over-hero={path === "/" && overHero}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty(
            "--glass-x",
            `${((event.clientX - rect.left) / rect.width) * 100}%`,
          );
        }}
      >
        <Link href="/" className="brand" aria-label="Chemizen Labs home">
          <Brand />
        </Link>
        <nav
          ref={nav}
          className="desktop-nav"
          aria-label="Main navigation"
          onPointerOver={(event) => {
            if (event.pointerType === "touch") return;
            moveGlass(
              event.target instanceof Element
                ? event.target.closest<HTMLAnchorElement>("a")
                : null,
            );
          }}
          onPointerLeave={restoreGlass}
          onFocus={(event) =>
            moveGlass(event.target.closest<HTMLAnchorElement>("a"))
          }
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              restoreGlass();
          }}
        >
          <span ref={glass} className="nav-glass-lens" aria-hidden="true" />
          {links.map(([name, url]) => (
            <Link
              key={url}
              href={url}
              aria-current={path.startsWith(url) ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
        </nav>
        <Link className="button button-ink header-register" href="/register">
          Register <ArrowUpRight size={16} />
        </Link>
        <button
          ref={button}
          className="menu-toggle icon-button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        {open && (
          <div ref={panel} id="mobile-menu" className="mobile-menu">
            <nav aria-label="Mobile navigation">
              {links.map(([name, url]) => (
                <Link
                  key={url}
                  href={url}
                  onClick={() => {
                    setOpen(false);
                    button.current?.focus();
                  }}
                >
                  {name}
                  <ArrowUpRight size={20} />
                </Link>
              ))}
              <Link href="/register" onClick={() => setOpen(false)}>
                Register <ArrowUpRight size={20} />
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
