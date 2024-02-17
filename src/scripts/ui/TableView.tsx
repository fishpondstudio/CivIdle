import { useState } from "react";

export interface ITableHeader {
   name: React.ReactNode;
   sortable: boolean;
   className?: string;
}

export function TableView<T>({
   extraClasses = "",
   header,
   data,
   compareFunc,
   renderRow,
}: {
   extraClasses?: string;
   header: ITableHeader[];
   data: T[];
   renderRow: (item: T) => React.ReactNode;
   compareFunc: (a: T, b: T, col: number) => number;
}): React.ReactNode {
   const [sortColumn, setSortColumn] = useState(header.findIndex((v) => v.sortable));
   const [asc, setAsc] = useState(true);
   return (
      <div className={`table-view ${extraClasses}`}>
         <table>
            <tbody>
               <tr>
                  {header.map((h, index) => (
                     <th
                        className={h.className}
                        onClick={() => {
                           if (h.sortable) {
                              setSortColumn(index);
                              setAsc(!asc);
                           }
                        }}
                     >
                        <div className="row">
                           <div>{h.name}</div>
                           {sortColumn === index ? (
                              <div className="m-icon small">{asc ? "arrow_upward" : "arrow_downward"}</div>
                           ) : null}
                        </div>
                     </th>
                  ))}
               </tr>
               {data
                  .sort((a, b) => (asc ? compareFunc(a, b, sortColumn) : -compareFunc(a, b, sortColumn)))
                  .map(renderRow)}
            </tbody>
         </table>
      </div>
   );
}
