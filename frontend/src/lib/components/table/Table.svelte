<script lang="ts" generics="T, CD">
  import * as Table from 'positron-components/components/ui/table';
  import { FlexRender } from 'positron-components/components/ui/data-table';
  import { ScrollArea } from 'positron-components/components/ui/scroll-area';
  import { createTable } from 'positron-components/components/table/helpers.svelte';
  import { cn } from 'positron-components/utils';
  import type { ColumnDef } from '@tanstack/table-core';

  type Props = {
    data?: T[] | Promise<T[] | undefined>;
    class?: string;
  } & (
    | {
        columns: (columnData: CD) => ColumnDef<T>[];
        columnData: CD;
      }
    | {
        columns: () => ColumnDef<T>[];
        columnData?: undefined;
      }
  );

  let { class: className, data, columns, columnData }: Props = $props();

  let rows = $state<T[]>([]);
  let isLoading = $state(true);

  $effect(() => {
    if (data instanceof Promise) {
      isLoading = true;
      data.then((d) => {
        rows = d || [];
        isLoading = false;
      });
    } else if (data) {
      rows = data;
      isLoading = false;
    }
  });

  let table = $derived(
    createTable(rows, columns(columnData as any), () => true)
  );
</script>

<div class={cn('flex w-full flex-col', className)}>
  <ScrollArea class="grid min-h-0 flex-1 rounded-md border" orientation="both">
    <Table.Root
      class={`min-w-[${table.getHeaderGroups()[0].headers.length * 100}px]`}
    >
      <Table.Header>
        {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
          <Table.Row>
            {#each headerGroup.headers as header (header.id)}
              <Table.Head>
                {#if !header.isPlaceholder}
                  <FlexRender
                    content={header.column.columnDef.header}
                    context={header.getContext()}
                  />
                {/if}
              </Table.Head>
            {/each}
          </Table.Row>
        {/each}
      </Table.Header>
      <Table.Body>
        {#each table.getRowModel().rows as row (row.id)}
          <Table.Row data-state={row.getIsSelected() && 'selected'}>
            {#each row.getVisibleCells() as cell (cell.id)}
              <Table.Cell class="group">
                <div
                  class="last-group:justify-end last-group:text-center last-group:h-full group-last:flex"
                >
                  <FlexRender
                    content={cell.column.columnDef.cell}
                    context={cell.getContext()}
                  />
                </div>
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={table.getAllColumns().length}
              class="h-24 text-center"
            >
              {isLoading ? 'Loading...' : 'No results.'}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </ScrollArea>
</div>
