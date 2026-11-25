import{n as e}from"./rolldown-runtime-WkwZ5CU-.js";import{i as t,t as n}from"./vendor-react-D30i__oY.js";import{t as r}from"./button-8i4LQrEk.js";import{a as i,i as a,n as o,r as s,s as c,t as l}from"./cells-g-f8Msvv.js";import{t as u}from"./switch-BETATXZg.js";import{r as d}from"./toast-PePh6sao.js";import{t as f}from"./lazy-data-table-BtjypmV-.js";import{t as p}from"./Example-CmMsgUlK.js";import{r as m,t as h}from"./demo-clock-CoEY-AlH.js";var g=e(t(),1),_=n();function v(e){return()=>{let t=e+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}var y=[`Ravi`,`Asha`,`Meera`,`Kabir`,`Sara`,`John`,`Priya`,`Arjun`,`Neha`,`Vikram`,`Ananya`,`Ada`,`Isha`,`Rohan`,`Tara`,`Dev`,`Zoya`,`Omar`,`Lena`,`Mateo`,`Yuki`,`Chloe`,`Noah`,`Amara`],b=[`Kumar`,`Verma`,`Iyer`,`Shah`,`Khan`,`Doe`,`Nair`,`Mehta`,`Gupta`,`Rao`,`Das`,`Rathore`,`Kapoor`,`Singh`,`Bose`,`Fischer`,`Tanaka`,`Okafor`,`Silva`,`Martin`],x=[`India`,`United States`,`Germany`,`Japan`,`Brazil`,`United Kingdom`,`Singapore`,`Nigeria`],S=[`Owner`,`Admin`,`Editor`,`Editor`,`Viewer`,`Viewer`,`Viewer`,`Billing`],C=[`active`,`active`,`active`,`active`,`trial`,`trial`,`past_due`,`churned`,`invited`],w=[`Free`,`Starter`,`Starter`,`Pro`,`Pro`,`Enterprise`],T={Free:0,Starter:29,Pro:99,Enterprise:499},E=864e5,D=m;function O(e){let t=v(42),n=e=>{let n=e[Math.floor(t()*e.length)];if(n===void 0)throw Error(`pick: the list is empty`);return n};return Array.from({length:e},(e,r)=>{let i=n(y),a=n(b),o=n(w),s=o===`Free`&&t()>.5?`trial`:n(C),c=1+Math.floor(t()*12);return{id:`usr_${(1e3+r).toString(36)}`,name:`${i} ${a}`,email:`${i}.${a}${r%7==0?r:``}@${n([`example.com`,`example.com`,`example.com`,`example.com`])}`.toLowerCase(),role:n(S),status:s,plan:o,mrr:s===`churned`||s===`invited`?0:T[o]*c,signedUp:new Date(D-Math.floor(t()*900)*E-Math.floor(t()*20)*3600*1e3).toISOString(),usage:Math.round(t()*100),country:n(x)}})}var k=O(312),A=k[0];A&&(k[0]={...A,name:`Ravi Kumar`,email:`ravi.kumar@example.com`});var j={active:`Active`,trial:`Trial`,past_due:`Past due`,churned:`Churned`,invited:`Invited`},M=Object.keys(j).map(e=>({value:e,label:j[e]})),N=[`Owner`,`Admin`,`Editor`,`Viewer`,`Billing`].map(e=>({value:e,label:e})),P=[`Free`,`Starter`,`Pro`,`Enterprise`].map(e=>({value:e,label:e})),F=[{id:`name`,header:`User`,minWidth:240,searchValue:e=>`${e.name} ${e.email}`,cell:({row:e,highlight:t})=>(0,_.jsx)(i,{name:e.name,email:e.email,highlight:t}),exportValue:e=>e.name},{id:`email`,header:`Email`,defaultHidden:!0},{id:`role`,header:`Role`,filter:`faceted`,filterOptions:N},{id:`status`,header:`Status`,filter:`faceted`,filterOptions:M,searchValue:e=>j[e.status],exportValue:e=>j[e.status],cell:({row:e,highlight:t})=>(0,_.jsx)(a,{value:e.status,label:t(j[e.status]),tones:{active:`success`,trial:`accent`,past_due:`warning`,churned:`danger`,invited:`neutral`}})},{id:`plan`,header:`Plan`,filter:`faceted`,filterOptions:P},{id:`mrr`,header:`MRR`,numeric:!0,searchable:!1,cell:({row:e})=>(0,_.jsx)(l,{value:e.mrr,locale:`en-US`})},{id:`signedUp`,header:`Signed up`,searchable:!1,sortFn:`datetime`,accessorFn:e=>new Date(e.signedUp),cell:({row:e})=>(0,_.jsx)(s,{value:e.signedUp,now:D,locale:h}),exportValue:e=>e.signedUp.slice(0,10)},{id:`usage`,header:`Usage`,numeric:!0,align:`left`,minWidth:180,searchable:!1,cell:({row:e})=>(0,_.jsx)(o,{value:e.usage,label:`Usage for ${e.name}`}),exportValue:e=>e.usage},{id:`country`,header:`Country`,defaultHidden:!0}],I=e=>(0,_.jsx)(`svg`,{"aria-hidden":!0,viewBox:`0 0 24 24`,className:`size-4`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,_.jsx)(`path`,{d:e})}),L=I(`M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z`),R=I(`M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4`),z=I(`M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13`),B=I(`M4 6h16v12H4zM4 7l8 6 8-6`);function V({user:e}){return(0,_.jsxs)(`div`,{className:`grid gap-4 text-sm sm:grid-cols-[repeat(4,minmax(0,1fr))_auto] sm:items-center`,children:[(0,_.jsx)(H,{label:`User id`,value:(0,_.jsx)(`code`,{className:`font-sheen-mono text-xs`,children:e.id})}),(0,_.jsx)(H,{label:`Country`,value:e.country}),(0,_.jsx)(H,{label:`Signed up`,value:new Date(e.signedUp).toLocaleDateString(h,{dateStyle:`long`})}),(0,_.jsx)(H,{label:`Annual value`,value:(0,_.jsx)(`span`,{className:`tabular-nums`,children:c(e.mrr*12,`USD`,`en-US`)})}),(0,_.jsx)(`div`,{className:`flex gap-2`,children:(0,_.jsxs)(r,{variant:`glass`,size:`sm`,leading:B,children:[`Email `,e.name.split(` `)[0]]})})]})}function H({label:e,value:t}){return(0,_.jsxs)(`div`,{className:`flex flex-col gap-0.5`,children:[(0,_.jsx)(`span`,{className:`text-xs text-sheen-fg-muted`,children:e}),(0,_.jsx)(`span`,{className:`font-medium text-sheen-fg`,children:t})]})}function U(){let e=d(),[t,n]=(0,g.useState)(k),[i,a]=(0,g.useState)(!1),[o,s]=(0,g.useState)(!1),[c,l]=(0,g.useState)(!1),m=(0,g.useCallback)(e=>n(t=>t.filter(t=>!e.has(t.id))),[]);return(0,_.jsx)(p,{title:`Full-featured (client-side)`,description:`312 generated users. Search highlights matches, filters show counts, shift-click headers to sort by several columns, shift-click checkboxes to select a range. Selection survives paging. Under 640px the rows become cards.`,variant:`bare`,controls:(0,_.jsxs)(_.Fragment,{children:[(0,_.jsx)(u,{checked:i,onCheckedChange:a,label:`Loading`}),(0,_.jsx)(u,{checked:o,onCheckedChange:s,label:`Error`}),(0,_.jsx)(u,{checked:c,onCheckedChange:l,label:`No data`}),(0,_.jsx)(r,{variant:`ghost`,size:`sm`,onClick:()=>n(k),disabled:t.length===k.length,children:`Restore deleted rows`})]}),code:`
import {
  CurrencyCell,
  DataTable,
  type DataTableColumn,
  ProgressCell,
  RelativeDateCell,
  StatusCell,
  UserCell,
  type DataTableFilterOption,
} from "@sheenui/theme";
import { Pencil as EditIcon, Eye as EyeIcon, Trash2 as TrashIcon } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Editor" | "Viewer" | "Billing";
  status: "active" | "trial" | "past_due" | "churned" | "invited";
  mrr: number;
  signedUp: string; // ISO date
  usage: number; // 0 to 100
  country: string;
};

// Your data: rows from an API or a store (a few inline here so the example runs as pasted).
const users: User[] = [
  { id: "u1", name: "Ravi Kumar", email: "ravi@example.com", role: "Owner", status: "active", mrr: 240, signedUp: "2025-01-14", usage: 82, country: "IN" },
  { id: "u2", name: "Asha Patel", email: "asha@example.com", role: "Admin", status: "trial", mrr: 0, signedUp: "2025-06-02", usage: 35, country: "GB" },
  { id: "u3", name: "Meera Shah", email: "meera@example.com", role: "Editor", status: "past_due", mrr: 90, signedUp: "2024-11-23", usage: 58, country: "US" },
  { id: "u4", name: "Kabir Rao", email: "kabir@example.com", role: "Viewer", status: "invited", mrr: 0, signedUp: "2025-08-30", usage: 4, country: "DE" },
];

const roleOptions: DataTableFilterOption[] = ["Owner", "Admin", "Editor", "Viewer", "Billing"].map((role) => ({ value: role, label: role }));
const statusOptions: DataTableFilterOption[] = ["active", "trial", "past_due", "churned", "invited"].map((status) => ({ value: status, label: status }));

export function Example() {
  const columns: DataTableColumn<User>[] = [
    {
      id: "name", header: "User", minWidth: 240,
      searchValue: (u) => \`\${u.name} \${u.email}\`,
      cell: ({ row, highlight }) => <UserCell name={row.name} email={row.email} highlight={highlight} />,
    },
    { id: "role", header: "Role", filter: "faceted", filterOptions: roleOptions },
    {
      id: "status", header: "Status", filter: "faceted", filterOptions: statusOptions,
      cell: ({ row }) => <StatusCell value={row.status} tones={{ active: "success", churned: "danger" }} />,
    },
    { id: "mrr", header: "MRR", numeric: true, cell: ({ row }) => <CurrencyCell value={row.mrr} locale="en-US" /> },
    { id: "signedUp", header: "Signed up", sortFn: "datetime", cell: ({ row }) => <RelativeDateCell value={row.signedUp} now={Date.now()} locale="en-US" /> },
    { id: "usage", header: "Usage", numeric: true, cell: ({ row }) => <ProgressCell value={row.usage} label="Usage" /> },
    { id: "country", header: "Country", defaultHidden: true },
  ];

  return (
    <DataTable
      caption="Workspace members"
      data={users}
      columns={columns}
      enableSelection
      mobileLayout="cards"
      maxHeight="36rem"
      rowActions={[
        { label: "View", icon: <EyeIcon />, onSelect: (u) => console.log("view", u.id) },
        { label: "Edit", icon: <EditIcon />, onSelect: (u) => console.log("edit", u.id) },
        { label: "Delete", icon: <TrashIcon />, tone: "danger", separatorBefore: true, onSelect: (u) => console.log("delete", u.id) },
      ]}
      bulkActions={[
        { label: "Delete", tone: "danger", icon: <TrashIcon />, onSelect: (rows, clear) => {
            console.log("delete", rows.length, "users");
            clear();
          } },
      ]}
      renderExpanded={(u) => (
        <p className="p-4 text-sm">
          {u.name} · {u.country} · {u.email}
        </p>
      )}
    />
  );
}`,children:(0,_.jsx)(f,{caption:`Workspace members`,data:c?[]:t,columns:F,getRowLabel:e=>e.name,enableSelection:!0,mobileLayout:`cards`,maxHeight:`36rem`,exportFilename:`members`,loading:i,error:o?`The members service timed out. Your filters are kept.`:void 0,onRetry:()=>{s(!1),e.info(`Retrying…`)},defaultSorting:[{id:`signedUp`,desc:!0}],rowActions:[{label:`View`,icon:L,onSelect:t=>e.info(`Viewing ${t.name}`)},{label:`Edit`,icon:R,onSelect:t=>e.info(`Editing ${t.name}`)},{label:`Delete`,icon:z,tone:`danger`,separatorBefore:!0,onSelect:t=>{m(new Set([t.id])),e.success(`Deleted ${t.name}`)}}],bulkActions:[{label:`Delete`,icon:z,tone:`danger`,onSelect:(t,n)=>{m(new Set(t.map(e=>e.id))),n(),e.success(`Deleted ${t.length} ${t.length===1?`user`:`users`}`)}}],renderExpanded:e=>(0,_.jsx)(V,{user:e})})})}export{M as a,j as i,k as n,N as r,U as t};