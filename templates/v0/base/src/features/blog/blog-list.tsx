import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No posts yet. Add a `posts` table and wire this module to it.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <Card key={post.slug}>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{post.publishedAt}</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{post.excerpt}</CardContent>
        </Card>
      ))}
    </div>
  );
}
