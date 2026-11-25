import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./badge-AQ2Afjwl.js";import{a as i,i as a,s as o,t as s}from"./cells-BQzuRXp-.js";import{t as c}from"./pagination-BmmT563r.js";import{t as l}from"./switch-BETATXZg.js";import{t as u}from"./lazy-data-table-DJIB9MPm.js";import{t as d}from"./Example-DMEbQwm9.js";import{a as f,i as p,n as m,r as h}from"./data-table-DicxSwY2.js";var g=e(t(),1),_=n();function v(e){let t=e.search.trim().toLowerCase(),n=e=>!t||`${e.name} ${e.email} ${e.role} ${p[e.status]}`.toLowerCase().includes(t),r=(t,n)=>e.filters.every(e=>e.id===n||e.value.includes(String(t[e.id]))),i=m.filter(e=>n(e)&&r(e));for(let{id:t,desc:n}of[...e.sorting].reverse())i.sort((e,r)=>{let i=e[t],a=r[t],o=typeof i==`number`&&typeof a==`number`?i-a:String(i).localeCompare(String(a));return n?-o:o});let a={};for(let e of[`status`,`role`]){let t={};for(let i of m)n(i)&&r(i,e)&&(t[i[e]]=(t[i[e]]??0)+1);a[e]=t}let o=e.pagination.pageIndex*e.pagination.pageSize;return{rows:i.slice(o,o+e.pagination.pageSize),total:i.length,facets:a}}function y(e,t){return new Promise((n,r)=>window.setTimeout(()=>{t?r(Error(`502 Bad Gateway`)):n(v(e))},600))}var b={sorting:[{id:`mrr`,desc:!0}],pagination:{pageIndex:0,pageSize:10},search:``,filters:[]},x=[{id:`name`,header:`Name`,minWidth:180,cell:({row:e,highlight:t})=>(0,_.jsx)(i,{name:e.name,email:e.email,highlight:t})},{id:`role`,header:`Role`,filter:`faceted`},{id:`status`,header:`Status`,filter:`faceted`,cell:({row:e,highlight:t})=>(0,_.jsx)(a,{value:e.status,label:t(p[e.status]),tones:{active:`success`,trial:`accent`,past_due:`warning`,churned:`danger`}})},{id:`mrr`,header:`MRR`,numeric:!0,cell:({row:e})=>(0,_.jsx)(s,{value:e.mrr,locale:`en-US`})}];function S(){let[e,t]=(0,g.useState)(b.sorting),[n,r]=(0,g.useState)(b.pagination),[i,a]=(0,g.useState)(``),[o,s]=(0,g.useState)([]),[c,p]=(0,g.useState)(()=>v(b)),[m,S]=(0,g.useState)(!1),[C,w]=(0,g.useState)(),[T,E]=(0,g.useState)(!1),[D,O]=(0,g.useState)(0),k=(0,g.useRef)(0),A=(0,g.useRef)(!0);(0,g.useEffect)(()=>{if(A.current&&!T&&D===0){A.current=!1;return}A.current=!1;let t=++k.current;S(!0),w(void 0),y({sorting:e,pagination:n,search:i,filters:o},T).then(e=>{t===k.current&&p(e)}).catch(e=>t===k.current&&w(e instanceof Error?e.message:String(e))).finally(()=>t===k.current&&S(!1))},[e,n,i,o,T,D]);let j=(0,g.useMemo)(()=>x.map(e=>e.filter?{...e,filterOptions:(e.id===`status`?f:h).map(t=>({...t,count:c.facets[e.id]?.[t.value]??0}))}:e),[c.facets]);return(0,_.jsx)(d,{title:`Server-side`,deferRender:!0,lazyPreview:!0,intrinsicHeight:921,description:`manual + rowCount: the table only renders. Sorting, search (debounced), filters and paging go to a fake API that answers after 600ms. While it loads, the previous rows stay in place under a veil, so nothing jumps.`,variant:`bare`,controls:(0,_.jsx)(l,{checked:T,onCheckedChange:E,label:`Fail requests`,description:`Shows the error state and Retry.`}),code:`
import { useState } from "react";
import { DataTable, type DataTableColumn, type DataTableColumnFilters, type DataTableSorting } from "@sheenui/theme";

type Customer = { id: string; name: string; plan: string; mrr: number };

const columns: DataTableColumn<Customer>[] = [
  { id: "name", header: "Customer" },
  { id: "plan", header: "Plan" },
  { id: "mrr", header: "MRR", numeric: true },
];

// Sketch (the hook is yours to write, so this is not runnable as pasted): sends sorting, pagination, search and filters to the server (TanStack Query, SWR or your own).
declare function useUsers(query: {
  sorting: DataTableSorting;
  pagination: { pageIndex: number; pageSize: number };
  search: string;
  filters: DataTableColumnFilters;
}): { data: Customer[]; total: number; isFetching: boolean; error?: Error; refetch: () => void };

export function Example() {
  const [sorting, setSorting] = useState<DataTableSorting>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<DataTableColumnFilters>([]);
  const { data, total, isFetching, error, refetch } = useUsers({ sorting, pagination, search, filters });

  return (
    <DataTable
      caption="Customers (server)"
      manual
      rowCount={total}
      data={data}
      columns={columns}
      loading={isFetching}
      error={error?.message}
      onRetry={refetch}
      sorting={sorting} onSortingChange={setSorting}
      pagination={pagination} onPaginationChange={setPagination}
      globalFilter={search} onGlobalFilterChange={setSearch}
      columnFilters={filters} onColumnFiltersChange={setFilters}
    />
  );
}`,children:(0,_.jsx)(u,{caption:`Customers (server)`,manual:!0,rowCount:c.total,data:c.rows,columns:j,getRowLabel:e=>e.name,loading:m,error:C,onRetry:()=>{E(!1),O(e=>e+1)},sorting:e,onSortingChange:t,pagination:n,onPaginationChange:r,globalFilter:i,onGlobalFilterChange:a,columnFilters:o,onColumnFiltersChange:s,labels:{searchPlaceholder:`Search customers…`}})})}var C=[{id:`INV-1042`,customer:`Acme Corp`,amount:1200,due:`2026-11-02`,status:`open`},{id:`INV-1041`,customer:`Globex`,amount:845.5,due:`2026-10-20`,status:`overdue`},{id:`INV-1040`,customer:`Initech`,amount:3200,due:`2026-10-12`,status:`paid`},{id:`INV-1039`,customer:`Umbrella`,amount:99,due:`2026-10-05`,status:`paid`},{id:`INV-1038`,customer:`Hooli`,amount:15e3,due:`2026-09-28`,status:`paid`}],w=[{id:`id`,header:`Invoice`},{id:`customer`,header:`Customer`},{id:`status`,header:`Status`,cell:({row:e})=>(0,_.jsx)(a,{value:e.status,label:e.status.charAt(0).toUpperCase()+e.status.slice(1),tones:{paid:`success`,open:`accent`,overdue:`danger`}})},{id:`due`,header:`Due`,sortFn:`alphanumeric`},{id:`amount`,header:`Amount`,numeric:!0,cell:({row:e})=>o(e.amount,`USD`,`en-US`,2)}];function T(){return(0,_.jsx)(d,{title:`Minimal`,lazyPreview:!0,deferRender:!0,intrinsicHeight:476,description:`Just data, columns and a caption. Search, sorting, export and the View menu come with sensible defaults; turn any of them off with a prop.`,variant:`bare`,code:`
import { DataTable, type DataTableColumn, formatCurrency } from "@sheenui/theme";

type Invoice = { id: string; customer: string; due: string; amount: number };

const invoices: Invoice[] = [
  { id: "INV-1001", customer: "Acme Corp", due: "Nov 30", amount: 1280 },
  { id: "INV-1002", customer: "Globex", due: "Dec 04", amount: 640.5 },
  { id: "INV-1003", customer: "Initech", due: "Dec 12", amount: 2210 },
];

export function Example() {
  const columns: DataTableColumn<Invoice>[] = [
    { id: "id", header: "Invoice" },
    { id: "customer", header: "Customer" },
    { id: "due", header: "Due" },
    { id: "amount", header: "Amount", numeric: true, cell: ({ row }) => formatCurrency(row.amount, "USD", "en-US", 2) },
  ];

  return (
    <DataTable caption="Recent invoices" data={invoices} columns={columns} hidePagination />
  );
}`,children:(0,_.jsx)(u,{caption:`Recent invoices`,data:C,columns:w,hidePagination:!0})})}function E(){let[e,t]=(0,g.useState)(0);return(0,_.jsx)(d,{title:`Loading and error states`,deferRender:!0,lazyPreview:!0,intrinsicHeight:1067,description:`While the first request runs the table shows skeleton rows with a sweep of light and a progress bar under the header. When it fails, an inline alert with a Retry button replaces the body (rows that were already on screen stay under a veil, with the alert below them).`,variant:`bare`,code:`
import { DataTable, type DataTableColumn } from "@sheenui/theme";

type Invoice = { id: string; customer: string; due: string };

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice" },
  { id: "customer", header: "Customer" },
  { id: "due", header: "Due" },
];

export function Example() {
  return (
    <div className="flex flex-col gap-6">
      <DataTable caption="Loading invoices" data={[]} columns={columns} loading hidePagination enableSearch={false} />
      <DataTable
        caption="Invoices that failed to load"
        data={[]}
        columns={columns}
        error="The billing service timed out. Check your connection and try again."
        onRetry={() => undefined}
        hidePagination
        enableSearch={false}
      />
    </div>
  );
}`,children:(0,_.jsxs)(`div`,{className:`flex flex-col gap-6`,children:[(0,_.jsx)(u,{caption:`Loading invoices`,data:[],columns:w,loading:!0,hidePagination:!0,enableSearch:!1}),(0,_.jsx)(u,{caption:`Invoices that failed to load`,data:[],columns:w,error:`The billing service timed out. Check your connection and try again.`,onRetry:()=>t(e=>e+1),hidePagination:!0,enableSearch:!1}),(0,_.jsx)(`p`,{className:`m-0 text-xs text-sheen-fg-muted`,"aria-live":`polite`,children:e===0?`Press Retry on the error to see it called.`:`Retry pressed ${e} time${e===1?``:`s`}.`})]})})}function D(){let[e,t]=(0,g.useState)(6);return(0,_.jsxs)(d,{title:`Pagination on its own`,deferRender:!0,lazyPreview:!0,intrinsicHeight:420,description:`A nav landmark with aria-current on the current page. The number of slots stays the same as you page, so buttons never jump under the pointer; on phones it collapses to “Page x of y”.`,stageClassName:`flex-col gap-8`,code:`
import { useState } from "react";
import { Pagination } from "@sheenui/theme";

export function Example() {
  const [page, setPage] = useState(6);

  return (
    <>
      <Pagination page={page} pageCount={24} onPageChange={setPage} aria-label="Search results pages" />
      <Pagination page={page} pageCount={24} onPageChange={setPage} size="sm" showFirstLast={false} siblingCount={2} />
      <Pagination defaultPage={2} pageCount={5} getPageHref={(p) => \`?page=\${p}\`} />
    </>
  );
}`,children:[(0,_.jsx)(c,{page:e,pageCount:24,onPageChange:t,"aria-label":`Search results pages`}),(0,_.jsx)(c,{page:e,pageCount:24,onPageChange:t,size:`sm`,showFirstLast:!1,siblingCount:2,"aria-label":`Compact pages`}),(0,_.jsxs)(`div`,{className:`flex flex-col items-center gap-2`,children:[(0,_.jsx)(c,{defaultPage:2,pageCount:5,getPageHref:e=>`#page-${e}`,onPageChange:()=>void 0,"aria-label":`Linked pages`}),(0,_.jsx)(r,{tone:`neutral`,children:`Renders links with getPageHref`})]})]})}var O=[`Paid`,`Pending`,`Shipped`,`Refunded`],k=Array.from({length:1e4},(e,t)=>({id:`ORD-${String(t+1).padStart(5,`0`)}`,customer:`Customer ${String(t*37%900+100)}`,status:O[t%O.length]??`Paid`,total:20+t*7919%48e3/100})),A=[{id:`id`,header:`Order`,minWidth:120},{id:`customer`,header:`Customer`,minWidth:150},{id:`status`,header:`Status`,minWidth:110},{id:`total`,header:`Total`,numeric:!0,minWidth:110,cell:({row:e})=>o(e.total,`USD`,`en-US`,2)}];function j(){let[e,t]=(0,g.useState)(null),[n,r]=(0,g.useState)(null);return(0,g.useEffect)(()=>{let t=e;if(!t)return;let n=()=>r(t.querySelectorAll(`tbody tr[data-row-id]`).length);n();let i=new MutationObserver(n);return i.observe(t,{childList:!0,subtree:!0}),()=>i.disconnect()},[e]),(0,_.jsx)(d,{title:`Ten thousand rows`,lazyPreview:!0,deferRender:!0,intrinsicHeight:612,description:`With maxHeight set, a page of 50 rows or more renders only the rows in view plus a few more (virtualize defaults to auto; pass virtualize to force it). Scroll to the end: the count below stays small, yet the scrollbar spans all 10,000. Rows outside the window are not in the DOM, so Tab skips them: set virtualize={false} for a table people tab through row by row.`,variant:`bare`,code:`
import { useEffect, useState } from "react";
import { DataTable, formatCurrency, type DataTableColumn } from "@sheenui/theme";

type Order = { id: string; customer: string; status: string; total: number };

const statuses = ["Paid", "Pending", "Shipped", "Refunded"];
const orders: Order[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: \`ORD-\${String(i + 1).padStart(5, "0")}\`,
  customer: \`Customer \${String(((i * 37) % 900) + 100)}\`,
  status: statuses[i % statuses.length] ?? "Paid",
  total: 20 + ((i * 7919) % 48000) / 100,
}));

const columns: DataTableColumn<Order>[] = [
  { id: "id", header: "Order", minWidth: 120 },
  { id: "customer", header: "Customer", minWidth: 150 },
  { id: "status", header: "Status", minWidth: 110 },
  {
    id: "total",
    header: "Total",
    numeric: true,
    minWidth: 110,
    cell: ({ row }) => formatCurrency(row.total, "USD", "en-US", 2),
  },
];

export function Example() {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);
  const [inDom, setInDom] = useState<number | null>(null);

  useEffect(() => {
    if (!wrapper) return;
    const count = () => setInDom(wrapper.querySelectorAll("tbody tr[data-row-id]").length);
    count();
    const observer = new MutationObserver(count);
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [wrapper]);

  return (
    <div ref={setWrapper} className="flex w-full flex-col gap-3">
      <p className="text-sm text-sheen-fg-muted">Rows in the DOM: {inDom} of 10,000</p>
      <DataTable
        caption="Orders"
        data={orders}
        columns={columns}
        maxHeight="22rem"
        virtualize
        hidePagination
        defaultPageSize={10_000}
      />
    </div>
  );
}`,children:(0,_.jsxs)(`div`,{ref:t,className:`flex w-full flex-col gap-3`,children:[(0,_.jsxs)(`p`,{className:`text-sm text-sheen-fg-muted`,"aria-live":`off`,children:[`Rows in the DOM: `,n??`…`,` of 10,000`]}),(0,_.jsx)(u,{caption:`Orders`,data:k,columns:A,maxHeight:`22rem`,virtualize:!0,hidePagination:!0,defaultPageSize:1e4})]})})}export{j as a,E as i,D as n,w as o,S as r,C as s,T as t};