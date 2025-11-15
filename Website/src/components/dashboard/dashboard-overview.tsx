"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/analytics/stats-card";
import { EngagementChart } from "@/components/analytics/engagement-chart";
import { FollowerGrowthChart } from "@/components/dashboard/follower-growth-chart";
import { TopPostsList } from "@/components/dashboard/top-posts-list";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  TrendingUp,
  FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalFollowers: number;
  totalFollowing: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  followerGrowth: number;
  engagementRate: number;
}

export function DashboardOverview({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("follower_count, following_count")
          .eq("id", userId)
          .single();

        // Fetch posts data
        const { data: posts } = await supabase
          .from("posts")
          .select("id, like_count, comment_count, share_count, save_count, created_at")
          .eq("user_id", userId);

        // Calculate totals
        const totalPosts = posts?.length || 0;
        const totalLikes = posts?.reduce((sum, post) => sum + (post.like_count || 0), 0) || 0;
        const totalComments = posts?.reduce((sum, post) => sum + (post.comment_count || 0), 0) || 0;
        const totalShares = posts?.reduce((sum, post) => sum + (post.share_count || 0), 0) || 0;
        const totalSaves = posts?.reduce((sum, post) => sum + (post.save_count || 0), 0) || 0;

        // Calculate engagement rate (likes + comments + shares) / followers
        const totalEngagement = totalLikes + totalComments + totalShares;
        const engagementRate = profile?.follower_count 
          ? ((totalEngagement / profile.follower_count) * 100).toFixed(1)
          : "0.0";

        // Calculate follower growth (placeholder - would need historical data)
        const followerGrowth = 0; // This would require tracking historical follower counts

        setStats({
          totalFollowers: profile?.follower_count || 0,
          totalFollowing: profile?.following_count || 0,
          totalPosts,
          totalLikes,
          totalComments,
          totalShares,
          totalSaves,
          followerGrowth,
          engagementRate: parseFloat(engagementRate),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Unable to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Followers"
          value={formatNumber(stats.totalFollowers)}
          icon={Users}
          trend={stats.followerGrowth > 0 ? `+${stats.followerGrowth} this month` : "No change"}
          trendDirection={stats.followerGrowth > 0 ? "up" : "down"}
        />
        <StatsCard
          title="Total Posts"
          value={formatNumber(stats.totalPosts)}
          icon={FileText}
          trend="All time"
          trendDirection="up"
        />
        <StatsCard
          title="Total Likes"
          value={formatNumber(stats.totalLikes)}
          icon={Heart}
          trend="Across all posts"
          trendDirection="up"
        />
        <StatsCard
          title="Engagement Rate"
          value={`${stats.engagementRate}%`}
          icon={TrendingUp}
          trend="Likes + Comments + Shares"
          trendDirection="up"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title="Comments"
          value={formatNumber(stats.totalComments)}
          icon={MessageSquare}
          trend="Total comments received"
          trendDirection="up"
        />
        <StatsCard
          title="Shares"
          value={formatNumber(stats.totalShares)}
          icon={Share2}
          trend="Total shares"
          trendDirection="up"
        />
        <StatsCard
          title="Saves"
          value={formatNumber(stats.totalSaves)}
          icon={Bookmark}
          trend="Total bookmarks"
          trendDirection="up"
        />
      </div>

      {/* Charts and Detailed Views */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Post Engagement (Last 30 Days)</CardTitle>
            <CardDescription>Likes, comments, and shares over time</CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
            <CardDescription>Your follower count over time</CardDescription>
          </CardHeader>
          <CardContent>
            <FollowerGrowthChart userId={userId} />
          </CardContent>
        </Card>
      </div>

      {/* Top Posts and Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPostsList userId={userId} />
        <RecentActivity userId={userId} />
      </div>
    </div>
  );
}

