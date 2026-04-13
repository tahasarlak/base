'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, Plus } from 'lucide-react';

export default function TicketsContent() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تیکت‌ها و پشتیبانی</h2>
          <p className="text-muted-foreground">مدیریت درخواست‌های کاربران</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          تیکت جدید
        </Button>
      </div>

      <Card className="py-20">
        <CardContent className="text-center">
          <Ticket className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
          <h3 className="text-2xl font-semibold mb-3">هیچ تیکتی وجود ندارد</h3>
          <p className="text-muted-foreground">تیکت‌های کاربران اینجا نمایش داده می‌شود</p>
        </CardContent>
      </Card>
    </div>
  );
}