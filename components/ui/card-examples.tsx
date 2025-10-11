/**
 * @fileoverview Card Component Examples
 * Demonstrates the enhanced card features including status indicators, skeleton, compact variant, and badges
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardSkeleton } from './card';
import { Button } from './button';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export function CardExamplesShowcase() {
  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Status Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card status="success">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Success
              </CardTitle>
              <CardDescription>Operation completed successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Your changes have been saved.</p>
            </CardContent>
          </Card>

          <Card status="warning">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Warning
              </CardTitle>
              <CardDescription>Action required</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Please review your settings.</p>
            </CardContent>
          </Card>

          <Card status="error">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Error
              </CardTitle>
              <CardDescription>Something went wrong</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Failed to process request.</p>
            </CardContent>
          </Card>

          <Card status="info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                Info
              </CardTitle>
              <CardDescription>Additional information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">New features are available.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Skeleton Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton showFooter={true} />
          <CardSkeleton contentLines={5} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Compact Variant</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="compact">
            <CardHeader>
              <CardTitle>Compact Card</CardTitle>
              <CardDescription>Reduced padding for dense layouts</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This card uses less space.</p>
            </CardContent>
          </Card>

          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard padding</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">This is the default card spacing.</p>
            </CardContent>
          </Card>

          <Card variant="compact" status="success">
            <CardHeader>
              <CardTitle>Compact + Status</CardTitle>
              <CardDescription>Combined features</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Compact with status indicator.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Badge Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card badge={5}>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Unread messages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">You have new notifications.</p>
            </CardContent>
          </Card>

          <Card badge="New" status="info">
            <CardHeader>
              <CardTitle>Feature Update</CardTitle>
              <CardDescription>Latest release</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Check out the new features.</p>
            </CardContent>
          </Card>

          <Card badge={99} variant="elevated">
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Inbox</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">You have many unread messages.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Combined Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card status="success" badge={3} hoverable>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>In progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">You have 3 tasks in progress.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">View Tasks</Button>
            </CardFooter>
          </Card>

          <Card variant="compact" status="warning" badge="!" clickable>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>Action required</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Items waiting for your approval.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Review Now</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Skeleton with Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CardSkeleton variant="compact" />
          <CardSkeleton variant="elevated" showFooter={true} />
          <CardSkeleton variant="bordered" contentLines={4} />
        </div>
      </section>
    </div>
  );
}
