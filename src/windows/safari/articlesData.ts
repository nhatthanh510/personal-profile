export interface Article {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
  readTime: string;
  tags: string[];
  content: string;
  url: string;
}

export const articles: Article[] = [
  {
    id: "modern-react-patterns",
    title: "Modern React Patterns in 2025: Beyond Hooks",
    excerpt:
      "Explore the latest patterns reshaping how we build React applications, from Server Components to signal-based reactivity and the future of state management.",
    thumbnail: "/images/blog1.png",
    date: "Feb 18, 2025",
    readTime: "8 min read",
    tags: ["React", "Architecture", "TypeScript"],
    url: "articles.portfolio.dev/modern-react-patterns",
    content: `The React ecosystem has evolved dramatically over the past year. With the stable release of Server Components and the growing adoption of concurrent features, the way we architect React applications has fundamentally changed.

Server Components have redefined the boundary between client and server code. By moving data fetching and heavy computation to the server, we can ship significantly less JavaScript to the client. This isn't just about performance - it changes how we think about component composition entirely.

One of the most impactful patterns emerging is the "use server" directive combined with Server Actions. Instead of building separate API routes, we can define server-side mutations directly alongside our component logic. This colocation of data and UI logic reduces boilerplate and makes the codebase more intuitive to navigate.

Signal-based reactivity, popularized by frameworks like Solid and Preact, is also influencing how React developers think about state. While React's reconciliation model remains fundamentally different, libraries like Jotai and Zustand have adopted signal-like patterns that offer fine-grained reactivity without sacrificing the React mental model.

The key takeaway is that modern React development is about choosing the right rendering strategy for each part of your application. Static pages can be pre-rendered, dynamic content can leverage streaming SSR, and highly interactive sections can remain fully client-side. The framework gives us the tools - it's up to us to compose them thoughtfully.`,
  },
  {
    id: "typescript-type-gymnastics",
    title: "Practical TypeScript: Type-Level Programming That Actually Matters",
    excerpt:
      "Move beyond basic types and learn the TypeScript patterns that make your codebase safer, from template literal types to conditional inference and branded types.",
    thumbnail: "/images/blog2.png",
    date: "Jan 24, 2025",
    readTime: "12 min read",
    tags: ["TypeScript", "DX", "Patterns"],
    url: "articles.portfolio.dev/typescript-type-gymnastics",
    content: `TypeScript's type system is remarkably powerful, but much of that power goes unused in everyday codebases. Let's look at practical type-level patterns that solve real problems rather than exist as intellectual exercises.

Branded types are one of the most underutilized patterns. By creating distinct types for values that share the same underlying representation, you can prevent entire categories of bugs at compile time. Consider user IDs and order IDs - both are strings, but passing one where the other is expected is almost certainly a bug. Branded types catch this.

Template literal types, introduced in TypeScript 4.1, enable string-level type safety that was previously impossible. Combined with mapped types, you can create fully typed event systems, route parameters, and configuration objects where the type system understands the structure of your strings.

Conditional types with the infer keyword unlock pattern matching at the type level. Need to extract the return type of a function? Unwrap a Promise? Pull the element type from an array? These operations become trivial with conditional inference, and they compose beautifully with generic constraints.

The satisfies operator, added in TypeScript 4.9, deserves special attention. It lets you validate that an expression matches a type without widening it, preserving the narrow literal types that TypeScript infers by default. This is invaluable for configuration objects where you want both type safety and precise autocomplete.

The goal isn't to write the most complex types possible. It's to encode your domain rules in the type system so that invalid states become unrepresentable. When the compiler catches a bug before your tests do, that's a win for everyone on the team.`,
  },
  {
    id: "css-architecture-scale",
    title: "CSS Architecture at Scale: Lessons from Large Codebases",
    excerpt:
      "How utility-first CSS, CSS Modules, and modern layout techniques come together in production applications serving millions of users.",
    thumbnail: "/images/blog3.png",
    date: "Dec 10, 2024",
    readTime: "10 min read",
    tags: ["CSS", "Tailwind", "Architecture"],
    url: "articles.portfolio.dev/css-architecture-scale",
    content: `Styling at scale remains one of the hardest problems in frontend development. After working on several large applications, I've found that the best CSS architecture isn't about picking one methodology - it's about understanding the tradeoffs and composing approaches strategically.

Utility-first CSS with Tailwind has proven its worth in large codebases. The constraint-based design system prevents style drift, and the purge step ensures that your CSS bundle stays small regardless of how many utilities you use. But the real benefit is colocation - styles live with the components they affect, making refactoring straightforward and eliminating the fear of changing shared stylesheets.

That said, Tailwind alone isn't sufficient for every situation. Complex animations, dynamic themes, and third-party component customization often benefit from CSS Modules or vanilla CSS with custom properties. The key is having clear guidelines for when to reach for each tool.

CSS Container Queries have changed how we approach responsive design in component libraries. Instead of relying on viewport-based media queries, components can adapt to the space they're given. This makes components truly reusable across different layout contexts without external styling overrides.

The CSS :has() selector, now supported in all modern browsers, enables parent-based styling that previously required JavaScript. Form validation states, empty state handling, and complex interactive patterns can now live entirely in CSS, reducing runtime overhead and improving accessibility.

Modern CSS is more capable than ever. The combination of custom properties, container queries, :has(), and utility frameworks gives us the tools to build maintainable style systems at any scale. The architecture challenge is knowing when to use each tool and establishing team conventions that prevent fragmentation.`,
  },
];
