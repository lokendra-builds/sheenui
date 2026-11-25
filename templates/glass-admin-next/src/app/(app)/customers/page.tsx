import type { Metadata } from "next";
import { CustomersView } from "@/views/customers";

export const metadata: Metadata = { title: "Customers | Lumen Console" };

export default function Page() {
  return <CustomersView />;
}
