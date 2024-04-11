import { useState } from "react";
import { keysOf } from "../../../shared/utilities/Helper";
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
   sortingState,
   paginate,
   perPage = 20,
}: {
   classNames?: string;
   header: ITableHeader[];
   data: T[];
   renderRow: (item: T) => React.ReactNode;
   compareFunc: (a: T, b: T, col: number) => number;
   sortingState?: { column: number; asc: boolean };
   paginate?: boolean;
   perPage?: number;
}): React.ReactNode {
   const [sortColumn, setSortColumn] = useState(sortingState?.column ?? header.findIndex((v) => v.sortable));
   if (import.meta.env.DEV) {
      console.assert(header[sortColumn].sortable, "TableView: Column is not sortable!");
   }
   const [asc, setAsc] = useState(sortingState?.asc ?? true);
   const [currentPage, setCurrentPage] = useState<number>(1);

   const getRows = () => {
      let returnedData = data.sort((a, b) =>
         asc ? compareFunc(a, b, sortColumn) : -compareFunc(a, b, sortColumn),
      );
      if (paginate === true) {
         returnedData = returnedData.slice((currentPage - 1) * perPage, currentPage * perPage);
      }
      return returnedData.map(renderRow);
   };
   const totalPages = Math.ceil(data.length / perPage);
   const paginateButton = {
      "<<": () => {
         setCurrentPage(1);
      },
      "<": () => {
         setCurrentPage((currentPage) => Math.max(currentPage - 1, 1));
      },
      ">": () => {
         setCurrentPage((currentPage) => Math.min(currentPage + 1, totalPages));
      },
      ">>": () => {
         setCurrentPage(totalPages);
      },
   };
   return (
      <>
         <div className={`table-view ${classNames ?? ""}`}>
            <table>
               <thead>
                  <tr>
                     {header.map((h, index) => (
                        <th
                           key={index}
                           className={h.className}
                           onClick={() => {
                              if (h.sortable) {
                                 setSortColumn(index);
                                 setAsc(!asc);
                                 if (sortingState) {
                                    sortingState.asc = !asc;
                                    sortingState.column = index;
                                 }
                              }
                           }}
                        >
                           {h.right ? (
                              <div className="row">
                                 {sortColumn === index ? (
                                    <div className="m-icon small">
                                       {asc ? "arrow_upward" : "arrow_downward"}
                                    </div>
                                 ) : null}
                                 <div className="f1"></div>
                                 <div>{h.name}</div>
                              </div>
                           ) : (
                              <div className="row">
                                 <div>{h.name}</div>
                                 {sortColumn === index ? (
                                    <div className="m-icon small">
                                       {asc ? "arrow_upward" : "arrow_downward"}
                                    </div>
                                 ) : null}
                              </div>
                           )}
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {getRows()}
                  {data.length === 0 ? (
                     <tr className="text-center text-desc">
                        <td colSpan={999}>{t(L.NothingHere)}</td>
                     </tr>
                  ) : null}
               </tbody>
            </table>
         </div>
         {paginate === true ? (
            <>
               <div className="sep5"></div>
               <div className="row jce">
                  <div className="row jce text-small text-desc">
                     Page {currentPage} of {totalPages}
                  </div>
                  {keysOf(paginateButton).map((symbol) => (
                     <button
                        className="ml2"
                        onClick={paginateButton[symbol]}
                        style={{ width: 27, padding: 0 }}
                     >
                        {symbol}
                     </button>
                  ))}
               </div>
            </>
         ) : (
            <></>
         )}
      </>
   );
}
