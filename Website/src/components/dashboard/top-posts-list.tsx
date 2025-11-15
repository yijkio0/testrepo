"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageSquare, Share2, Bookmark, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface TopPost {
  id: number;
  text: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  save_count: number;
  created_at: string;
  total_engagement: number;
}

export function TopPostsList({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchTopPosts() {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("id, text, like_count, comment_count, share_count, save_count, created_at")
          .eq("user_id", userId)
          .order("like_count", { ascending: false })
          .limit(5);

        if (error) throw error;

        const postsWithEngagement = (data || []).map((post) => ({
          ...post,
          total_engagement:
            (post.like_count || 0) +
            (post.comment_count || 0) +
            (post.share_count || 0) +
            (post.save_count || 0),
        }));

        // Sort by total engagement
        postsWithEngagement.sort((a, b) => b.total_engagement - a.total_engagement);

        setPosts(postsWithEngagement);
      } catch (error) {
        console.error("Error fetching top posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopPosts();
  }, [userId, supabase]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
          <CardDescription>Your most engaging posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No posts yet. Start creating content to see your top performers here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatText = (text: string | null) => {
    if (!text) return "Post";
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
        <CardDescription>Your most engaging posts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{formatText(post.text)}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{post.like_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.comment_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      <span>{post.share_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      <span>{post.save_count || 0}</span>
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

