import { useEffect, useState } from "react";
import { L, t } from "../../../shared/utilities/i18n";

export interface ITableHeader {
   name: React.ReactNode;
   sortable: boolean;
   className?: string;
   right?: boolean;
}

export function TableView<T>({
   classNames,
   header,
   data,
   compareFunc,
   renderRow,
   defaultSortOrder = true,
   defaultSortColumn,
   onSort = () => {},
}: {
   classNames?: string;
   header: ITableHeader[];
   data: T[];
   renderRow: (item: T) => React.ReactNode;
   compareFunc: (a: T, b: T, col: number) => number;
   defaultSortOrder?: boolean;
   defaultSortColumn?: number;
   onSort?: (o: boolean, i: number) => void;
}): React.ReactNode {
   if (defaultSortColumn === undefined) {
      defaultSortColumn = header.findIndex((v) => v.sortable);
   }
   const [sortColumn, setSortColumn] = useState(defaultSortColumn);
   const [asc, setAsc] = useState(defaultSortOrder);
   useEffect(() => {
      onSort(asc, sortColumn);
   }, [onSort, asc, sortColumn]);
   return (
      <div className={`table-view ${classNames ?? ""}`}>
         <table>
            <tbody>
               <tr>
                  {header.map((h, index) => (
                     <th
                        key={index}
                        className={h.className}
                        onClick={() => {
                           if (h.sortable) {
                              setSortColumn(index);
                              setAsc(!asc);
                           }
                        }}
                     >
                        {h.right ? (
                           <div className="row">
                              {sortColumn === index ? (
                                 <div className="m-icon small">{asc ? "arrow_upward" : "arrow_downward"}</div>
                              ) : null}
                              <div className="f1"></div>
                              <div>{h.name}</div>
                           </div>
                        ) : (
                           <div className="row">
                              <div>{h.name}</div>
                              {sortColumn === index ? (
                                 <div className="m-icon small">{asc ? "arrow_upward" : "arrow_downward"}</div>
                              ) : null}
                           </div>
                        )}
                     </th>
                  ))}
               </tr>
               {data
                  .sort((a, b) => (asc ? compareFunc(a, b, sortColumn) : -compareFunc(a, b, sortColumn)))
                  .map(renderRow)}
               {data.length === 0 ? (
                  <tr className="text-center text-desc">
                     <td colSpan={999}>{t(L.NothingHere)}</td>
                  </tr>
               ) : null}
            </tbody>
         </table>
      </div>
   );
}
