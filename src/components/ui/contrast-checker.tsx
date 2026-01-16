'use client';

import { useState } from 'react';
import {
  checkWCAGCompliance,
  accessibleColorPairs,
} from '@/lib/color-contrast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ContrastChecker() {
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [fontWeight, setFontWeight] = useState(400);

  const result = checkWCAGCompliance(
    foreground,
    background,
    fontSize,
    fontWeight
  );

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed right-4 bottom-4 z-50 w-80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm">Color Contrast Checker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="foreground" className="text-xs">
              Foreground
            </Label>
            <Input
              id="foreground"
              type="color"
              value={foreground}
              onChange={e => setForeground(e.target.value)}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="background" className="text-xs">
              Background
            </Label>
            <Input
              id="background"
              type="color"
              value={background}
              onChange={e => setBackground(e.target.value)}
              className="h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="fontSize" className="text-xs">
              Font Size (px)
            </Label>
            <Input
              id="fontSize"
              type="number"
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="fontWeight" className="text-xs">
              Font Weight
            </Label>
            <Input
              id="fontWeight"
              type="number"
              value={fontWeight}
              onChange={e => setFontWeight(Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <div
          className="rounded p-3 text-center"
          style={{
            backgroundColor: background,
            color: foreground,
            fontSize: `${fontSize}px`,
            fontWeight: fontWeight,
          }}
        >
          Sample Text
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs">Contrast Ratio:</span>
            <Badge
              variant={result.level === 'fail' ? 'destructive' : 'default'}
            >
              {result.ratio.toFixed(2)}:1
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs">WCAG AA:</span>
            <Badge variant={result.aa ? 'default' : 'destructive'}>
              {result.aa ? 'Pass' : 'Fail'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs">WCAG AAA:</span>
            <Badge variant={result.aaa ? 'default' : 'destructive'}>
              {result.aaa ? 'Pass' : 'Fail'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Accessible Presets:</Label>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(accessibleColorPairs).map(([name, colors]) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  setForeground(colors.foreground);
                  setBackground(colors.background);
                }}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
