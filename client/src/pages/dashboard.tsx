import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { formatTimeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/sidebar";
import { 
  Users, 
  Clock,
  BookOpen,
  Award,
  Target,
  TrendingUp,
  Activity,
  GraduationCap,
  Calendar,
  FileText,
  Star,
  Zap,
  RefreshCw,
  PlayCircle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { RecentActivity } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/stats`],
    enabled: !!userId,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<RecentActivity[]>({
    queryKey: [`/api/users/${userId}/activities`],
    enabled: !!userId,
  });

  // Data queries for student dashboard
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/student/enrollments"],
    enabled: !!userId,
  });



  const { data: courses, isLoading: coursesLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/courses"],
    enabled: !!userId,
  });

  const { data: studentResults, isLoading: resultsLoading } = useQuery<any[]>({
    queryKey: ["/api/mongo/student/my-results"],
    enabled: !!userId && user?.role === 'student',
  });

  // Get user dashboard stats
  const { data: dashboardStats, isLoading: dashboardStatsLoading } = useQuery({
    queryKey: ["/api/mongo/user/stats"],
    enabled: !!userId,
  });

  // Manual refresh function for dashboard data
  const handleRefresh = () => {
    if (!userId) return;
    
    queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/stats`] });
    queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/activities`] });
    queryClient.invalidateQueries({ queryKey: ["/api/mongo/courses"] });
    queryClient.invalidateQueries({ queryKey: ["/api/mongo/user/stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/mongo/student/enrollments"] });
    if (user?.role === 'student') {
      queryClient.invalidateQueries({ queryKey: ["/api/mongo/student/my-results"] });
    }
  };

  // Calculate enhanced dashboard metrics with real-time updates
  const dashboardData = user?.role === 'admin' ? {
    // Admin-specific metrics
    totalCourses: dashboardStats?.totalCourses || courses?.length || 0,
    totalStudents: dashboardStats?.totalStudents || 0,
    availableTests: dashboardStats?.availableTests || 0,
    averageScore: dashboardStats?.averageScore || 0,
    overallProgressAverage: dashboardStats?.overallProgressAverage || 0,
    studentProgressData: dashboardStats?.studentProgressData || [],
  } : {
    // Student-specific metrics
    totalEnrolled: enrollments?.length || 0,
    completedCourses: enrollments?.filter(e => (e.progress || 0) >= 100)?.length || 0,
    inProgressCourses: enrollments?.filter(e => (e.progress || 0) > 0 && (e.progress || 0) < 100)?.length || 0,
    
    // Performance metrics with synchronized normalized scoring
    totalTests: studentResults?.length || 0,
    averageScore: dashboardStats?.averageScore || (studentResults?.length ? 
      Math.round(
        studentResults.reduce((sum: number, test: any) => sum + ((test.score || 0) / (test.maxScore || 100) * 100), 0) / studentResults.length
      ) : 0),
    
    // Progress tracking
    overallProgress: enrollments?.length ? 
      Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length) : 0,
    
    // Recent activity metrics
    recentlyEnrolled: enrollments?.filter(e => {
      const enrollDate = new Date(e.createdAt || e.enrolledAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return enrollDate >= weekAgo;
    })?.length || 0,
  };

  if (statsLoading || enrollmentsLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64 min-h-screen p-8">
          <div className="rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 mb-8">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-8 h-8 text-white animate-spin" />
                </div>
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-6 w-96" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen overflow-auto">
        <div className="p-8 space-y-8">
          {/* Enhanced Welcome Section */}
          <div className="rounded-3xl border border-white/20 shadow-2xl overflow-hidden bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.firstName}! 🎓
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Continue your learning journey and track your progress in real-time
                      </p>
                    </div>
                  </div>
                  
                  {/* Manual Refresh Indicator & Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">Manual Refresh</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRefresh}
                      className="bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => setLocation('/courses')}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Browse Courses
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {user?.role === 'admin' ? (
              <>
                {/* Total Courses */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-300 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalCourses}</p>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-500">Platform-wide</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Students */}
                <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-300 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalStudents}</p>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-500">Active learners</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Overall Progress Average */}
                <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-300 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress Average</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.overallProgressAverage}%</p>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-500">All students</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Average Test Score */}
                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-300 relative">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Test Score</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.averageScore}%</p>
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-500">Platform-wide</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                        <Award className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Enrolled Courses */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-300 relative">
                  <CardContent className="p-6">
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full " />
                    </div>
                    <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Courses</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.totalEnrolled}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{dashboardData.recentlyEnrolled} this week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-300 relative">
              <CardContent className="p-6">
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full " />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.completedCourses}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {dashboardData.totalEnrolled > 0 ? Math.round((dashboardData.completedCourses / dashboardData.totalEnrolled) * 100) : 0}% completion rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Performance */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-300 relative">
              <CardContent className="p-6">
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full " />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Score Avg</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.averageScore}%
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                      <Target className="w-3 h-3 mr-1" />
                      {dashboardData.totalTests} tests completed
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Progress */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow duration-300 relative">
              <CardContent className="p-6">
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full " />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Progress</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardData.overallProgress}%
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                      <Activity className="w-3 h-3 mr-1" />
                      Manual tracking
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
              </>
            )}
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Course Progress */}
            <div className="lg:col-span-2 space-y-8">
              {user?.role === 'admin' ? (
                <>
                  {/* Admin: Student Progress Overview */}
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          <span>Student Progress Overview</span>
                        </CardTitle>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Manual
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {dashboardData.studentProgressData && dashboardData.studentProgressData.length > 0 ? (
                          dashboardData.studentProgressData.slice(0, 8).map((student, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {student.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {student.testsCompleted} tests completed
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {student.progress}%
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Course Progress
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Course Progress</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{student.progress}%</span>
                              </div>
                              <Progress value={student.progress} className="h-2 mb-2" />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Test Average</span>
                                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{student.averageScore}%</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No student progress data</p>
                            <p className="text-sm">Students will appear here once they start taking courses</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Admin: Test Results Summary */}
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span>Platform Test Performance</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overall student test results across all courses</p>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {dashboardData.averageScore}%
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Average test score across all students
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{dashboardData.totalStudents}</p>
                            <p className="text-gray-600 dark:text-gray-400">Total Students</p>
                          </div>
                          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                            <p className="font-medium text-gray-900 dark:text-white">{dashboardData.availableTests}</p>
                            <p className="text-gray-600 dark:text-gray-400">Available Tests</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Student: Course Progress Overview */}
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <span>My Course Progress</span>
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your learning journey</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Manual
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {enrollments && enrollments.length > 0 ? (
                      enrollments.slice(0, 5).map((enrollment, index) => {
                        const course = courses?.find(c => c._id === enrollment.courseId);
                        return (
                          <div key={enrollment.id || index} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <PlayCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {course?.title || 'Unknown Course'}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {course?.category || 'General'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {enrollment.progress || 0}%
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {enrollment.progress >= 100 ? 'Completed' : 'In Progress'}
                                </p>
                              </div>
                            </div>
                            <Progress value={enrollment.progress || 0} className="h-2" />
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No enrollments yet</p>
                        <p className="text-sm">Start your learning journey by enrolling in courses</p>
                        <Button 
                          className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600"
                          onClick={() => setLocation('/courses')}
                        >
                          Browse Courses
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Test Results Summary */}
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <span>Recent Test Performance</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your latest assessment results</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentResults && studentResults.length > 0 ? (
                      // Group test results by course
                      Object.entries(
                        studentResults.reduce((acc: any, result: any) => {
                          const courseTitle = result.course?.title || 'Unknown Course';
                          if (!acc[courseTitle]) {
                            acc[courseTitle] = {
                              course: result.course,
                              testResults: []
                            };
                          }
                          acc[courseTitle].testResults.push(result);
                          return acc;
                        }, {})
                      ).slice(0, 3).map(([courseTitle, courseData]: [string, any], index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {courseTitle}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {courseData.testResults.length} tests completed
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900 dark:text-white">
                                {courseData.testResults.length ? 
                                  Math.round(courseData.testResults.reduce((sum: number, test: any) => sum + ((test.score || 0) / (test.maxScore || 100) * 100), 0) / courseData.testResults.length) 
                                  : 0}%
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400">
                                Average Score
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No test results available yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
                </>
              )}
            </div>

            {/* Right Column - Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    onClick={() => setLocation('/courses')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse All Courses
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation('/test-results')}
                  >
                    <Award className="w-4 h-4 mr-2" />
                    View Test Results
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.role === 'admin' ? 'Platform Stats' : 'Learning Stats'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.role === 'admin' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Courses</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.totalCourses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Students</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.totalStudents}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Progress Average</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.overallProgressAverage}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Test Average</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.averageScore}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Courses</span>
                        <span className="font-bold text-gray-900 dark:text-white">{courses?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Enrolled</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.totalEnrolled}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Completed</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.completedCourses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                        <span className="font-bold text-gray-900 dark:text-white">{dashboardData.averageScore}%</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Achievement Badge */}
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {user?.role === 'admin' ? 'Platform Excellence!' : 'Keep Learning!'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.role === 'admin' 
                      ? 'Your platform is thriving! Monitor student progress and continue growing the learning community.'
                      : "You're making great progress. Complete more courses to unlock achievements!"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Manual Refresh Status */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Manual Refresh</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700">
              <RefreshCw className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">Click to refresh</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}