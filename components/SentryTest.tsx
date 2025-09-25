/**
 * @fileoverview Sentry Test Component
 * @description Component for testing Sentry functionality in development
 */

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, CheckCircle, Info, Bug } from 'lucide-react';
import { testSentryLogging, testSentryException } from '../lib/sentryInit';

import { logger } from '../lib/logging/logger';
interface SentryTestProps {
  className?: string;
}

export const SentryTest: React.FC<SentryTestProps> = ({ className }) => {
  const handleTestLogging = () => {
    const success = testSentryLogging();
    if (success) {
      alert('✅ Sentry logging test completed! Check your Sentry dashboard.');
    } else {
      alert('❌ Sentry logging test failed. Check console for details.');
    }
  };

  const handleTestException = () => {
    const success = testSentryException();
    if (success) {
      alert('✅ Sentry exception test completed! Check your Sentry dashboard.');
    } else {
      alert('❌ Sentry exception test failed. Check console for details.');
    }
  };

  const handleTestError = () => {
    try {
      // This will trigger an error that should be caught by Sentry
      throw new Error('Manual test error from React component');
    } catch (error) {
      // Error will be automatically captured by the error handling system
      alert('🚨 Test error thrown! Check your Sentry dashboard for the captured exception.');
    }
  };

  const handleTestConsoleLog = () => {
    logger.info('🧪 This is a test logger.info message');
    logger.warn('⚠️ This is a test logger.warn message');
    logger.error('❌ This is a test logger.error message');
    alert('📝 Test console messages sent! Check your Sentry dashboard for captured logs.');
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Sentry Test Panel
        </CardTitle>
        <CardDescription>
          Test Sentry error tracking and logging functionality. Only visible in development mode.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleTestLogging}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Info className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Test Logging</div>
              <div className="text-xs text-muted-foreground">Send test messages to Sentry</div>
            </div>
          </Button>

          <Button
            onClick={handleTestException}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <AlertTriangle className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Test Exception</div>
              <div className="text-xs text-muted-foreground">Send test exception to Sentry</div>
            </div>
          </Button>

          <Button
            onClick={handleTestError}
            variant="destructive"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <Bug className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Test Error</div>
              <div className="text-xs text-muted-foreground">Throw and catch test error</div>
            </div>
          </Button>

          <Button
            onClick={handleTestConsoleLog}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            <div className="text-center">
              <div className="font-medium">Test Console</div>
              <div className="text-xs text-muted-foreground">Send console logs to Sentry</div>
            </div>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Instructions:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click any button to test Sentry functionality</li>
            <li>• Check your browser console for test messages</li>
            <li>• Visit your Sentry dashboard to see captured events</li>
            <li>• This panel only appears in development mode</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentryTest;
