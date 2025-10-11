"use client"

import * as React from "react"
import { Heart, Share2, Download, Star, Calendar, Clock, User, Mail, Phone, Users, DollarSign, CreditCard, Activity } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

export function CardExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Card Component Examples</h1>
        <p className="text-muted-foreground">
          Various implementations of the shadcn/ui Card component
        </p>
      </div>

      {/* Basic Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Card</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>
                This is a basic card with header, content, and footer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the main content area of the card. You can put any content here.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Learn More</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Action</CardTitle>
              <CardDescription>
                Card with an action button in the header
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card demonstrates the CardAction component for header actions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>
                Card with interactive elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">65% complete</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Profile Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Profile Card</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">John Doe</CardTitle>
                  <CardDescription>Software Engineer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  john.doe@example.com
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  +1 (555) 123-4567
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Contact</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="https://github.com/vercel.png" alt="Profile" />
                    <AvatarFallback>AC</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Alice Chen</CardTitle>
                    <CardDescription>Product Manager</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Leading product development with 5+ years of experience in tech startups.
              </p>
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button variant="outline" size="sm">Message</Button>
              <Button size="sm">Follow</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Statistics Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Now</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Feature Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-dashed border-muted-foreground/25">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Premium Feature
              </CardTitle>
              <CardDescription>
                Unlock advanced functionality with our premium plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Custom integrations
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade Now</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download Report</CardTitle>
              <CardDescription>
                Get your monthly performance report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Report generated</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last updated</span>
                  <span>2 hours ago</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Meeting</CardTitle>
              <CardDescription>
                Book a call with our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Available slots</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Today, 2:00 PM</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Tomorrow, 10:00 AM</span>
                    <Badge variant="secondary">Available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Book Meeting</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Timeline Card */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Timeline Card</h2>
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Track your project progress and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Project kickoff</p>
                  <p className="text-sm text-muted-foreground">January 15, 2024</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
              <Separator />
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Design phase</p>
                  <p className="text-sm text-muted-foreground">February 1, 2024</p>
                </div>
                <Badge variant="secondary">In Progress</Badge>
              </div>
              <Separator />
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Development</p>
                  <p className="text-sm text-muted-foreground">March 1, 2024</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

