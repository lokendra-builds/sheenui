import { useState } from "react";
import { Pagination, Tabs, TabsList, TabsPanel, TabsTab } from "@sheenui/theme";

/* A live example of /docs/rtl in its own chunk, so the page loads only the code a visible example needs (see RtlDocsPage.tsx). */

/** The right-to-left tabs and pagination. */
export function WrapperDemo() {
  const [page, setPage] = useState(3);
  return (
    <div dir="rtl" lang="ar" className="flex w-full max-w-md flex-col gap-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTab value="overview">نظرة عامة</TabsTab>
          <TabsTab value="projects">المشاريع</TabsTab>
          <TabsTab value="settings">الإعدادات</TabsTab>
        </TabsList>
        <TabsPanel value="overview">إحصاءات مساحة العمل.</TabsPanel>
        <TabsPanel value="projects">المراحل والمسؤولون.</TabsPanel>
        <TabsPanel value="settings">الملف الشخصي والفواتير.</TabsPanel>
      </Tabs>
      <Pagination page={page} onPageChange={setPage} pageCount={12} />
    </div>
  );
}
