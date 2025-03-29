"use client"

import { useState } from "react"
import { Search, Plus, Moon, Sun, Filter, Star, StarOff, ExternalLink, ChevronDown, Bookmark } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for content items
const contentItems = [
  {
    id: 1,
    title: "The Future of Remote Work: Trends to Watch in 2024",
    source: "medium.com",
    tags: ["productivity", "work"],
    summary: [
      "Remote work adoption increased by 87% since 2020",
      "Hybrid models becoming the new standard for most companies",
      "Digital collaboration tools evolving to support asynchronous work",
      "Mental health considerations becoming central to remote work policies",
    ],
    favorite: true,
    date: "2 days ago",
  },
  {
    id: 2,
    title: "10 Productivity Hacks That Actually Work",
    source: "lifehacker.com",
    tags: ["productivity", "tips"],
    summary: [
      "Time-blocking is more effective than to-do lists",
      "The Pomodoro Technique increases focus and reduces burnout",
      "Digital minimalism reduces cognitive load",
      "Morning routines set the tone for productive days",
    ],
    favorite: false,
    date: "1 week ago",
  },
  {
    id: 3,
    title: "Understanding React Server Components",
    source: "vercel.com",
    tags: ["development", "react"],
    summary: [
      "Server Components reduce JavaScript sent to the client",
      "Improved performance for data-heavy applications",
      "Better SEO with server-rendered content",
      "Seamless integration with existing React applications",
    ],
    favorite: true,
    date: "3 days ago",
  },
  {
    id: 4,
    title: "The Science of Sleep: How Rest Affects Productivity",
    source: "healthline.com",
    tags: ["health", "productivity"],
    summary: [
      "7-9 hours of sleep optimizes cognitive function",
      "REM sleep is crucial for memory consolidation",
      "Blue light exposure before bed reduces sleep quality",
      "Sleep consistency is more important than total hours",
    ],
    favorite: false,
    date: "2 weeks ago",
  },
  {
    id: 5,
    title: "Building a Second Brain: A Proven Method to Organize Your Digital Life",
    source: "fortelabs.com",
    tags: ["productivity", "organization"],
    summary: [
      "PARA method organizes information by actionability",
      "Progressive summarization makes review efficient",
      "Digital notes should be organized for future discovery",
      "Regular review cycles maintain system effectiveness",
    ],
    favorite: true,
    date: "5 days ago",
  },
  {
    id: 6,
    title: "The Psychology of Habit Formation",
    source: "jamesclear.com",
    tags: ["habits", "psychology"],
    summary: [
      "Habits form through the cue-craving-response-reward cycle",
      "Environment design is more effective than willpower",
      "Habit stacking builds on existing behaviors",
      "Small, consistent changes lead to significant results",
    ],
    favorite: false,
    date: "1 month ago",
  },
]

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<number[]>(
    contentItems.filter((item) => item.favorite).map((item) => item.id),
  )
  const [activeTab, setActiveTab] = useState("all")
  const [addLinkOpen, setAddLinkOpen] = useState(false)

  // Filter content based on search query and active tab
  const filteredContent = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "favorites") return matchesSearch && favorites.includes(item.id)
    return matchesSearch && item.tags.includes(activeTab)
  })

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((itemId) => itemId !== id))
    } else {
      setFavorites([...favorites, id])
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-2 font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
                <Bookmark className="h-5 w-5" />
              </div>
              <span className="hidden sm:inline-block text-lg font-bold">WiseCache</span>
            </a>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="font-medium transition-colors hover:text-primary">
                Home
              </a>
              <a href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
                Categories
              </a>
              <a href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
                Search
              </a>
              <a href="#" className="font-medium text-muted-foreground transition-colors hover:text-primary">
                Profile
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mr-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          {/* Header and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Knowledge Library</h1>
              <p className="text-muted-foreground mt-1">Curate and organize your valuable content in one place.</p>
            </div>
            <Dialog open={addLinkOpen} onOpenChange={setAddLinkOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
                  <Plus className="h-4 w-4" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Content</DialogTitle>
                  <DialogDescription>Enter the URL of the content you want to save.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input id="url" placeholder="https://example.com/article" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input id="tags" placeholder="productivity, article, important" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddLinkOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setAddLinkOpen(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or tag..."
                className="pl-10 h-12 rounded-md border-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-12 px-4">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setActiveTab("all")}>All Content</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("favorites")}>Favorites</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("productivity")}>Productivity</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("development")}>Development</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("health")}>Health</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-5 lg:w-auto lg:grid-cols-5 p-1 bg-muted/50">
              <TabsTrigger value="all" className="rounded-md">
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" className="rounded-md">
                Favorites
              </TabsTrigger>
              <TabsTrigger value="productivity" className="rounded-md">
                Productivity
              </TabsTrigger>
              <TabsTrigger value="development" className="rounded-md">
                Development
              </TabsTrigger>
              <TabsTrigger value="health" className="hidden md:block rounded-md">
                Health
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
              >
                <CardHeader className="pb-3 bg-muted/20">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{item.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      {favorites.includes(item.id) ? (
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle favorite</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </CardHeader>
                <CardContent className="pb-3 pt-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs font-medium bg-secondary/70">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-primary">AI Summary:</h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      {item.summary.slice(0, 2).map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-primary">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-3 border-t bg-muted/10">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs hover:text-primary">
                    <ChevronDown className="h-3 w-3" />
                    Read More
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs hover:bg-primary hover:text-primary-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open Original
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">No content found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                We couldn't find any content matching your search criteria. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0 bg-muted/20">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">© 2024 WiseCache. All rights reserved.</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

