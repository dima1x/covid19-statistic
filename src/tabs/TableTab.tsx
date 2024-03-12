import { useState, useMemo } from 'react';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';

import { Record } from '../modules/Covid19Statistic';
import * as Calculator from '../modules/Calculator';

import '../styles/table.css';

function TableTab(props: {records: Record[], setRecords: any}) {
  const [sorting, setSorting] = useState<SortingState>([
    {id: 'country', desc: false }
  ]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [countryFilter, setCountryFilter] = useState("");
  const [filter, setFilter] = useState("none");
  const [filterValueFrom, setFilterValueFrom] = useState("");
  const [filterValueTo, setFilterValueTo] = useState("");
  const [rowCount, setRowCount] = useState(20);

  const columns = useMemo<ColumnDef<Record>[]>(
    () => [
      {
        accessorKey: 'country',
        header: 'Страна',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'casesCount',
        header: 'Количество случаев',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'deathsCount',
        header: 'Количество смертей',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'allCasesCount',
        header: 'Количество случаев всего',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'allDeathsCount',
        header: 'Количество смертей всего',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'casesCountPer1000',
        header: 'Количество случаев на 1000 жителей',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'deathsCountPer1000',
        header: 'Количество смертей на 1000 жителей',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'averageCasesCountPerDay',
        header: 'среднее количество заболеваний в день',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'averageDeathsCountPerDay',
        header: 'среднее количество смертей в день',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'maxCasesCount',
        header: 'максимальное количество заболеваний',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'maxDeathsCount',
        header: 'максимальное количество смертей',
        cell: info => info.getValue(),
      },
    ],
    []
  )

  const table = useReactTable({
    data: props.records,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: rowCount,
      },
    },
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  function updateFilter({filterParam, filterValueFromParam, filterValueToParam}: {filterParam?: string, filterValueFromParam?: string, filterValueToParam?: string}) {
    if (filterParam !== undefined) {
      setFilter(filterParam);

      if (filter !== "none") table.getColumn(filter)?.setFilterValue([]);
    }

    if (filterValueFromParam !== undefined) setFilterValueFrom(filterValueFromParam);
    if (filterValueToParam !== undefined) setFilterValueTo(filterValueToParam);

    if (filterParam === "none" || (filterParam === undefined && filter === "none")) return;

    let min: string | number = filterValueFromParam === undefined ? filterValueFrom : filterValueFromParam;
    let max: string | number = filterValueToParam === undefined ? filterValueTo : filterValueToParam;
    
    min = min !== "" ? Number(min) : 0;
    max = max !== "" ? Number(max) : Number.MAX_VALUE;

    if (min > max) return;

    table.getColumn(filterParam === undefined ? filter : filterParam)?.setFilterValue([min, max]);
  }

  function changeRowCount(value: number) {
    setRowCount(value);
    table.setPageSize(value);
  }

  function clearFilters() {
    setCountryFilter("");
    setFilter("none");
    setFilterValueFrom("");
    setFilterValueTo("");

    table.resetColumnFilters();
  }

  return (
    <>
      <div className="filters">
        <div className="top">
          <div className="country">
            <input value={countryFilter} placeholder='Поиск страны...' onChange={x => { setCountryFilter(x.target.value); table.getColumn("country")?.setFilterValue(x.target.value); }} />
            <button>🔍</button>
          </div>
          <div className="range-filter">
            <div className="range-filter-right clearfix">
              <select value={filter} onChange={x => updateFilter({filterParam: x.target.value}) }>
                <option value="none">Фильтровать по полю...</option>
                <option value="casesCount">Количество случаев</option>
                <option value="deathsCount">Количество смертей</option>
                <option value="allCasesCount">Количество случаев всего</option>
                <option value="allDeathsCount">Количество смертей всего</option>
                <option value="casesCountPer1000">Количество случаев на 1000 жителей</option>
                <option value="deathsCountPer1000">Количество смертей на 1000 жителей</option>
                <option value="averageCasesCountPerDay">Среднее количество заболеваний в день</option>
                <option value="averageDeathsCountPerDay">Среднее количество смертей в день</option>
                <option value="maxCasesCount">Максимальное количество заболеваний</option>
                <option value="maxDeathsCount">Максимальное количество смертей</option>
              </select>
              <input className={Calculator.isNumber(filterValueFrom) ? "" : "error"} value={filterValueFrom} onChange={x => updateFilter({filterValueFromParam: x.target.value})} placeholder='значения от' />
              <input className={Calculator.isNumber(filterValueTo) ? "" : "error"} value={filterValueTo} onChange={x => updateFilter({filterValueToParam: x.target.value})} placeholder='значения до' />
            </div>
          </div>
        </div>
        <div className="bottom clearfix">
          <button onClick={() => clearFilters()}>Сбросить фильтры</button>
        </div>
      </div>

      <div className="table">
        {(() => {
          let thead = [];
          
          thead = table.getHeaderGroups().map((headerGroup) => {
            return (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan} {...{
                      className: header.column.getCanSort()
                        ? 'cursor-pointer select-none'
                        : '',
                      onClick: header.column.getToggleSortingHandler(),
                    }}>
                      {header.isPlaceholder ? null : (
                        <div>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? ' ⇅'}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            )
          })
          
          let tbody = [];
          let emptyBody = [
            (
              <div key="empty-table" style={{height: (2.2 * table.getState().pagination.pageSize) + "vw"}} className='empty-table'>
                <p>Ничего не найдено!</p>
              </div>
            )
          ]

          if (table.getRowModel().rows.length > 0) {
            tbody = table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })

            for (let i = table.getRowModel().rows.length - 1; i < table.getState().pagination.pageSize - 1; i++) {
              tbody.push(
                <tr key={"empty_" + i}>
                  {((i: number) => {
                    const td = [];
                    
                    for (let j = 0; j < columns.length; j++)  
                      td.push(<td key={"empty_" + i + "_" + j} />);

                    return td;
                  })(i)}
                </tr>
              )
            }
          } else tbody = [null];

          return (
            <>
            <table>
              <thead>
                {thead}
              </thead>
              <tbody>
                {tbody}
              </tbody>
            </table>
            {table.getRowModel().rows.length === 0 ? emptyBody : null}
            </>
          );
        })()}
      </div>
      <div className="table-bottom">
        <div className="row-count">
          <select value={rowCount} onChange={x => changeRowCount(Number(x.target.value))}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className='pages'>
          <div className='page-buttons clearfix'>
            <button className='edge' onClick={() => table.setPageIndex(0)}>{"<<"}</button>
            {(() => {
              let pageButtons = [];

              if (table.getPageCount() === 0) {
                pageButtons.push(<button key="pageButton_1" className='selected' onClick={() => table.setPageIndex(0)}>1</button>);
                return pageButtons;
              }

              let minIndex = table.getState().pagination.pageIndex - 1 > 0 ? table.getState().pagination.pageIndex - 1 : 0;
              let maxIndex = minIndex + 4 <= table.getPageCount() ? minIndex + 4 : table.getPageCount();

              if (maxIndex > 3 && maxIndex === table.getPageCount()) minIndex = maxIndex - 4;

              for (let i = minIndex; i < maxIndex; i++) {
                pageButtons.push(
                  <button className={i === table.getState().pagination.pageIndex ? 'selected' : ''} key={"pageButton_" + i} onClick={() => table.setPageIndex(i)}>{i + 1}</button>
                );
              }

              if (maxIndex < table.getPageCount())
                pageButtons.push(
                  <button className='next' key={"pageButton_" + maxIndex} onClick={() => table.setPageIndex(maxIndex)}>...</button>
                );

              return pageButtons;
            })()}
            <button className='edge' onClick={() => table.setPageIndex(table.getPageCount() - 1)}>{">>"}</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default TableTab;