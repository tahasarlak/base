'use client';

import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

type TableConfig = {
  isTable: true;
  columns: ColumnDef<any>[];
  fetchData: () => Promise<any[]>;
  searchKey: string;
  placeholder?: string;
};

type ContentConfig = {
  isTable: false;
  Content: React.ComponentType;
};

type Props = {
  config: TableConfig | ContentConfig;
};

export default async function DynamicSectionRenderer({ config }: Props) {
  if (config.isTable) {
    const { columns, fetchData, searchKey, placeholder } = config;
    const data = await fetchData();

    return (
      <DataTable
        columns={columns}
        data={data}
        searchKey={searchKey}
        placeholder={placeholder || "جستجو کنید..."}
      />
    );
  } else {
    const { Content } = config;
    return <Content />;
  }
}