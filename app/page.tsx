"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Github, Youtube, Search, Download, Edit3, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobEntry {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  description?: string
}

interface ContentItem {
  id: string
  title: string
  type: "github" | "blog" | "video" | "talk"
  url: string
  date: string
  description: string
  jobId?: string
  confidence: number
}

interface UserInput {
  name: string
  description: string
  github?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  role?: string
  companyWebsite?: string
  jobs: JobEntry[]
}

export default function AutoResumePage() {
  const [step, setStep] = useState<"input" | "processing" | "editor">("input")
  const [userInput, setUserInput] = useState<UserInput>({
    name: "",
    description: "",
    jobs: [],
  })
  const [newJob, setNewJob] = useState<Partial<JobEntry>>({})
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [editingContent, setEditingContent] = useState<string | null>(null)

  // Mock content items for demo
  const mockContentItems: ContentItem[] = [
    {
      id: "1",
      title: "React Performance Optimization Guide",
      type: "blog",
      url: "https://example.com/blog/react-perf",
      date: "2023-08-15",
      description: "Comprehensive guide on optimizing React applications for better performance",
      confidence: 0.92,
    },
    {
      id: "2",
      title: "next-auth-toolkit",
      type: "github",
      url: "https://github.com/user/next-auth-toolkit",
      date: "2023-06-20",
      description: "Open source authentication toolkit for Next.js applications",
      confidence: 0.88,
    },
    {
      id: "3",
      title: "Building Scalable Web Apps",
      type: "video",
      url: "https://youtube.com/watch?v=example",
      date: "2023-04-10",
      description: "Conference talk about building scalable web applications with modern frameworks",
      confidence: 0.85,
    },
  ]

  const addJob = () => {
    if (newJob.title && newJob.company && newJob.startDate) {
      const job: JobEntry = {
        id: Date.now().toString(),
        title: newJob.title,
        company: newJob.company,
        startDate: newJob.startDate,
        endDate: newJob.endDate || "Present",
        description: newJob.description,
      }
      setUserInput((prev) => ({
        ...prev,
        jobs: [...prev.jobs, job],
      }))
      setNewJob({})
    }
  }

  const removeJob = (jobId: string) => {
    setUserInput((prev) => ({
      ...prev,
      jobs: prev.jobs.filter((job) => job.id !== jobId),
    }))
  }

  const handleGenerate = async () => {
    setStep("processing")
    // Simulate API call
    setTimeout(() => {
      setContentItems(mockContentItems)
      setStep("editor")
    }, 2000)
  }

  const assignContentToJob = (contentId: string, jobId: string) => {
    setContentItems((prev) => prev.map((item) => (item.id === contentId ? { ...item, jobId } : item)))
  }

  const removeContentAssignment = (contentId: string) => {
    setContentItems((prev) => prev.map((item) => (item.id === contentId ? { ...item, jobId: undefined } : item)))
  }

  const getContentIcon = (type: ContentItem["type"]) => {
    switch (type) {
      case "github":
        return <Github className="h-4 w-4" />
      case "blog":
        return <Edit3 className="h-4 w-4" />
      case "video":
        return <Youtube className="h-4 w-4" />
      case "talk":
        return <Youtube className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800"
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  if (step === "input") {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AutoResume</h1>
            <p className="text-gray-600">Generate a timeline resume from your public work</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
              <CardDescription>We'll search for your public content and match it to your work history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={userInput.name}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                  <Input
                    id="linkedin"
                    value={userInput.linkedin || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="linkedin.com/in/janedoe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={userInput.description}
                  onChange={(e) => setUserInput((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Jane Doe is a web developer working at Vercel who focuses on frontend frameworks."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={userInput.github || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, github: e.target.value }))}
                    placeholder="github.com/janedoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={userInput.twitter || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, twitter: e.target.value }))}
                    placeholder="twitter.com/janedoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={userInput.youtube || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, youtube: e.target.value }))}
                    placeholder="youtube.com/@janedoe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role you're applying for *</Label>
                  <Input
                    id="role"
                    value={userInput.role || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="Senior Frontend Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company website *</Label>
                  <Input
                    id="companyWebsite"
                    value={userInput.companyWebsite || ""}
                    onChange={(e) => setUserInput((prev) => ({ ...prev, companyWebsite: e.target.value }))}
                    placeholder="https://company.com"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full"
                disabled={!userInput.name || !userInput.description || !userInput.role || !userInput.companyWebsite}
              >
                <Search className="h-4 w-4 mr-2" />
                Generate Resume
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <h3 className="text-lg font-semibold">Searching for your content...</h3>
              <p className="text-sm text-gray-600">We're analyzing your public work and matching it to your timeline</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{userInput.name}'s Resume</h1>
            <p className="text-sm text-gray-600">Review and edit your timeline</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("input")}>
              Edit Input
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-6">Career Timeline</h2>
            <div className="space-y-6">
              {userInput.jobs.length === 0 ? (
                // Create mock timeline with sample jobs and content with edit/move functionality
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        1
                      </div>
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-lg">Senior Frontend Developer</CardTitle>
                          <CardDescription>Vercel • 2023-01 - Present</CardDescription>
                          <p className="text-sm text-gray-600">
                            Leading frontend architecture and developer experience initiatives
                          </p>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-medium mb-3">Associated Work</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Edit3 className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                {editingContent === "content-1" ? (
                                  <div className="space-y-2">
                                    <Input
                                      defaultValue="React Performance Optimization Guide"
                                      className="text-sm font-medium"
                                    />
                                    <Textarea
                                      defaultValue="Comprehensive guide on optimizing React applications for better performance"
                                      className="text-xs"
                                      rows={2}
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => setEditingContent(null)}>
                                        Save
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => setEditingContent(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <h5 className="font-medium text-sm">React Performance Optimization Guide</h5>
                                    <p className="text-xs text-gray-600 mb-2">
                                      Comprehensive guide on optimizing React applications for better performance
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        blog
                                      </Badge>
                                      <Badge className="text-xs bg-green-100 text-green-800">92% match</Badge>
                                      <span className="text-xs text-gray-500">2023-08-15</span>
                                    </div>
                                    <a
                                      href="https://example.com/blog/react-perf"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                    >
                                      View Content →
                                    </a>
                                  </>
                                )}
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingContent(editingContent === "content-1" ? null : "content-1")}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Full Stack Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Github className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">Vercel UI Components Library</h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  Built and maintained a comprehensive React component library for internal teams
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    github
                                  </Badge>
                                  <Badge className="text-xs bg-green-100 text-green-800">95% match</Badge>
                                  <span className="text-xs text-gray-500">2023-05-10</span>
                                </div>
                                <a
                                  href="https://github.com/user/vercel-ui"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View Content →
                                </a>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Full Stack Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Youtube className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">Next.js 14 Deep Dive</h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  Technical presentation on new features and performance improvements in Next.js 14
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    video
                                  </Badge>
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">87% match</Badge>
                                  <span className="text-xs text-gray-500">2023-11-20</span>
                                </div>
                                <a
                                  href="https://youtube.com/watch?v=nextjs14"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View Content →
                                </a>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Full Stack Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        2
                      </div>
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-lg">Full Stack Developer</CardTitle>
                          <CardDescription>TechCorp • 2021-06 - 2022-12</CardDescription>
                          <p className="text-sm text-gray-600">Built scalable web applications and APIs</p>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-medium mb-3">Associated Work</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Github className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">next-auth-toolkit</h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  Open source authentication toolkit for Next.js applications
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    github
                                  </Badge>
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">88% match</Badge>
                                  <span className="text-xs text-gray-500">2022-06-20</span>
                                </div>
                                <a
                                  href="https://github.com/user/next-auth-toolkit"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View Content →
                                </a>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Senior Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Edit3 className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">Database Optimization Strategies</h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  Blog post series on optimizing PostgreSQL queries and database performance
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    blog
                                  </Badge>
                                  <Badge className="text-xs bg-green-100 text-green-800">91% match</Badge>
                                  <span className="text-xs text-gray-500">2022-03-15</span>
                                </div>
                                <a
                                  href="https://example.com/blog/db-optimization"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View Content →
                                </a>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Senior Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        3
                      </div>
                      <Card className="flex-1">
                        <CardHeader>
                          <CardTitle className="text-lg">Frontend Developer</CardTitle>
                          <CardDescription>StartupXYZ • 2020-01 - 2021-05</CardDescription>
                          <p className="text-sm text-gray-600">
                            Developed user interfaces and improved user experience
                          </p>
                        </CardHeader>
                        <CardContent>
                          <h4 className="font-medium mb-3">Associated Work</h4>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5">
                                <Youtube className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm">Building Scalable Web Apps</h5>
                                <p className="text-xs text-gray-600 mb-2">
                                  Conference talk about building scalable web applications with modern frameworks
                                </p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    video
                                  </Badge>
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">85% match</Badge>
                                  <span className="text-xs text-gray-500">2021-04-10</span>
                                </div>
                                <a
                                  href="https://youtube.com/watch?v=scalable-apps"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                >
                                  View Content →
                                </a>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <div className="relative group">
                                  <Button variant="ghost" size="sm">
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Senior Frontend Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Full Stack Developer
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                                      Move to Additional Content
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-xs text-red-600"
                                    >
                                      Remove Completely
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                // Keep the existing userInput.jobs.map logic unchanged
                userInput.jobs.map((job, index) => {
                  const jobContent = contentItems.filter((item) => item.jobId === job.id)
                  return (
                    <div key={job.id} className="relative">
                      {index !== userInput.jobs.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <Card className="flex-1">
                          <CardHeader>
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <CardDescription>
                              {job.company} • {job.startDate} - {job.endDate}
                            </CardDescription>
                            {job.description && <p className="text-sm text-gray-600">{job.description}</p>}
                          </CardHeader>
                          {jobContent.length > 0 && (
                            <CardContent>
                              <h4 className="font-medium mb-3">Associated Work</h4>
                              <div className="space-y-3">
                                {jobContent.map((item) => (
                                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0 mt-0.5">{getContentIcon(item.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm">{item.title}</h5>
                                      <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {item.type}
                                        </Badge>
                                        <Badge className={cn("text-xs", getConfidenceColor(item.confidence))}>
                                          {Math.round(item.confidence * 100)}% match
                                        </Badge>
                                        <span className="text-xs text-gray-500">{item.date}</span>
                                      </div>
                                      <a
                                        href={item.url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                                      >
                                        View Content →
                                      </a>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeContentAssignment(item.id)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Unassigned Content */}
          <div>
            <h2 className="text-lg font-semibold mb-6">Additional Content</h2>
            <div className="space-y-4">
              {contentItems
                .filter((item) => !item.jobId)
                .map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getContentIcon(item.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                          <Badge className={cn("text-xs", getConfidenceColor(item.confidence))}>
                            {Math.round(item.confidence * 100)}% match
                          </Badge>
                        </div>
                        <a
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline mt-1 block"
                        >
                          View Content →
                        </a>
                        <div className="space-y-1">
                          {userInput.jobs.map((job) => (
                            <Button
                              key={job.id}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => assignContentToJob(item.id, job.id)}
                            >
                              <Check className="h-3 w-3 mr-2" />
                              Assign to {job.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
