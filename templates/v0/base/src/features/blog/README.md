# Blog module

Opt-in module included when `features.blog: true`.

Mount it where the product wants a blog, for example
`src/app/blog/page.tsx`:

```tsx
import { BlogList } from "@/features/blog/blog-list";

export default function BlogPage() {
  return <BlogList posts={[]} />;
}
```

Posts are intentionally not part of the base Convex schema. Add a `posts`
table and a query when the product has real content, and keep the module's
interface stable.
