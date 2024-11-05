<script setup lang="ts" generic="TData = any, TColDef extends ColDef<TData> = ColDef<any>">
// @START_IMPORTS@
import type {
  AdvancedFilterBuilderVisibleChangedEvent,
  AsyncTransactionsFlushedEvent,
  BodyScrollEndEvent,
  BodyScrollEvent,
  CellClickedEvent,
  CellContextMenuEvent,
  CellDoubleClickedEvent,
  CellEditRequestEvent,
  CellEditingStartedEvent,
  CellEditingStoppedEvent,
  CellFocusedEvent,
  CellKeyDownEvent,
  CellMouseDownEvent,
  CellMouseOutEvent,
  CellMouseOverEvent,
  CellSelectionChangedEvent,
  CellSelectionDeleteEndEvent,
  CellSelectionDeleteStartEvent,
  CellValueChangedEvent,
  ChartCreatedEvent,
  ChartDestroyedEvent,
  ChartOptionsChangedEvent,
  ChartRangeSelectionChangedEvent,
  ColumnEverythingChangedEvent,
  ColumnGroupOpenedEvent,
  ColumnHeaderClickedEvent,
  ColumnHeaderContextMenuEvent,
  ColumnHeaderMouseLeaveEvent,
  ColumnHeaderMouseOverEvent,
  ColumnMenuVisibleChangedEvent,
  ColumnMovedEvent,
  ColumnPinnedEvent,
  ColumnPivotChangedEvent,
  ColumnPivotModeChangedEvent,
  ColumnResizedEvent,
  ColumnRowGroupChangedEvent,
  ColumnValueChangedEvent,
  ColumnVisibleEvent,
  ComponentStateChangedEvent,
  ContextMenuVisibleChangedEvent,
  CutEndEvent,
  CutStartEvent,
  DisplayedColumnsChangedEvent,
  DragCancelledEvent,
  DragStartedEvent,
  DragStoppedEvent,
  ExpandOrCollapseAllEvent,
  FillEndEvent,
  FillStartEvent,
  FilterChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  FirstDataRenderedEvent,
  FullWidthCellKeyDownEvent,
  GridColumnsChangedEvent,
  GridReadyEvent,
  GridSizeChangedEvent,
  HeaderFocusedEvent,
  ModelUpdatedEvent,
  NewColumnsLoadedEvent,
  PaginationChangedEvent,
  PasteEndEvent,
  PasteStartEvent,
  PinnedRowDataChangedEvent,
  PivotMaxColumnsExceededEvent,
  RangeDeleteEndEvent,
  RangeDeleteStartEvent,
  RangeSelectionChangedEvent,
  RedoEndedEvent,
  RedoStartedEvent,
  RowClickedEvent,
  RowDataUpdatedEvent,
  RowDoubleClickedEvent,
  RowDragCancelEvent,
  RowDragEndEvent,
  RowDragEnterEvent,
  RowDragLeaveEvent,
  RowDragMoveEvent,
  RowEditingStartedEvent,
  RowEditingStoppedEvent,
  RowGroupOpenedEvent,
  RowSelectedEvent,
  RowValueChangedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
  StateUpdatedEvent,
  StoreRefreshedEvent,
  ToolPanelSizeChangedEvent,
  ToolPanelVisibleChangedEvent,
  TooltipHideEvent,
  TooltipShowEvent,
  UndoEndedEvent,
  UndoStartedEvent,
  ViewportChangedEvent,
  VirtualColumnsChangedEvent,
  VirtualRowRemovedEvent
} from "ag-grid-community";
// @END_IMPORTS@

import {
  _ALL_GRID_OPTIONS,
  _ALL_EVENTS,
  _combineAttributesAndGridOptions,
  _getCallbackForEvent,
  _processOnChange,
  ALWAYS_SYNC_GLOBAL_EVENTS,
  createGrid,
  _warn
} from 'ag-grid-community';

// noinspection ES6UnusedImports
import type {AgEventType, ColDef, GridApi, IRowNode} from "ag-grid-community";

import type {Ref} from 'vue'
import {markRaw, onMounted, reactive, ref, toRaw, toRefs, useTemplateRef, watch} from 'vue';
import {getProps, debounce} from "@/components/utils";
import type {Properties, Props} from "@/components/utils";


const ROW_DATA_EVENTS: Set<string> = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
const DATA_MODEL_ATTR_NAME = 'onUpdate:modelValue'; // emit name would be update:ModelValue
const DATA_MODEL_EMIT_NAME = 'update:modelValue';

const emits = defineEmits<{
// @START_EVENTS@
  /** The tool panel visibility has changed. Fires twice if switching between panels - once with the old panel and once with the new panel.
   */
  'toolPanelVisibleChanged': [event: ToolPanelVisibleChangedEvent<TData>],
  /** The tool panel size has been changed.
   */
  'toolPanelSizeChanged': [event: ToolPanelSizeChangedEvent<TData>],
  /** The column menu visibility has changed. Fires twice if switching between tabs - once with the old tab and once with the new tab.
   */
  'columnMenuVisibleChanged': [event: ColumnMenuVisibleChangedEvent<TData>],
  /** The context menu visibility has changed (opened or closed).
   */
  'contextMenuVisibleChanged': [event: ContextMenuVisibleChangedEvent<TData>],
  /** Cut operation has started.
   */
  'cutStart': [event: CutStartEvent<TData>],
  /** Cut operation has ended.
   */
  'cutEnd': [event: CutEndEvent<TData>],
  /** Paste operation has started.
   */
  'pasteStart': [event: PasteStartEvent<TData>],
  /** Paste operation has ended.
   */
  'pasteEnd': [event: PasteEndEvent<TData>],
  /** A column, or group of columns, was hidden / shown.
   */
  'columnVisible': [event: ColumnVisibleEvent<TData>],
  /** A column, or group of columns, was pinned / unpinned.
   */
  'columnPinned': [event: ColumnPinnedEvent<TData>],
  /** A column was resized.
   */
  'columnResized': [event: ColumnResizedEvent<TData>],
  /** A column was moved.
   */
  'columnMoved': [event: ColumnMovedEvent<TData>],
  /** A value column was added or removed.
   */
  'columnValueChanged': [event: ColumnValueChangedEvent<TData>],
  /** The pivot mode flag was changed.
   */
  'columnPivotModeChanged': [event: ColumnPivotModeChangedEvent<TData>],
  /** A pivot column was added, removed or order changed.
   */
  'columnPivotChanged': [event: ColumnPivotChangedEvent<TData>],
  /** A column group was opened / closed.
   */
  'columnGroupOpened': [event: ColumnGroupOpenedEvent<TData>],
  /** User set new columns.
   */
  'newColumnsLoaded': [event: NewColumnsLoadedEvent<TData>],
  /** The list of grid columns changed.
   */
  'gridColumnsChanged': [event: GridColumnsChangedEvent<TData>],
  /** The list of displayed columns changed. This can result from columns open / close, column move, pivot, group, etc.
   */
  'displayedColumnsChanged': [event: DisplayedColumnsChangedEvent<TData>],
  /** The list of rendered columns changed (only columns in the visible scrolled viewport are rendered by default).
   */
  'virtualColumnsChanged': [event: VirtualColumnsChangedEvent<TData>],
  /** @deprecated v32.2 Either use `onDisplayedColumnsChanged` which is fired at the same time,
   * or use one of the more specific column events.
   */
  'columnEverythingChanged': [event: ColumnEverythingChangedEvent<TData>],
  /** A mouse cursor is initially moved over a column header.
   */
  'columnHeaderMouseOver': [event: ColumnHeaderMouseOverEvent<TData>],
  /** A mouse cursor is moved out of a column header.
   */
  'columnHeaderMouseLeave': [event: ColumnHeaderMouseLeaveEvent<TData>],
  /** A click is performed on a column header.
   */
  'columnHeaderClicked': [event: ColumnHeaderClickedEvent<TData>],
  /** A context menu action, such as right-click or context menu key press, is performed on a column header.
   */
  'columnHeaderContextMenu': [event: ColumnHeaderContextMenuEvent<TData>],
  /** Only used by Angular, React and VueJS AG Grid components (not used if doing plain JavaScript).
   * If the grid receives changes due to bound properties, this event fires after the grid has finished processing the change.
   */
  'componentStateChanged': [event: ComponentStateChangedEvent<TData>],
  /** Value has changed after editing (this event will not fire if editing was cancelled, eg ESC was pressed) or
   *  if cell value has changed as a result of cut, paste, cell clear (pressing Delete key),
   * fill handle, copy range down, undo and redo.
   */
  'cellValueChanged': [event: CellValueChangedEvent<TData>],
  /** Value has changed after editing. Only fires when `readOnlyEdit=true`.
   */
  'cellEditRequest': [event: CellEditRequestEvent<TData>],
  /** A cell's value within a row has changed. This event corresponds to Full Row Editing only.
   */
  'rowValueChanged': [event: RowValueChangedEvent<TData>],
  /** Editing a cell has started.
   */
  'cellEditingStarted': [event: CellEditingStartedEvent<TData>],
  /** Editing a cell has stopped.
   */
  'cellEditingStopped': [event: CellEditingStoppedEvent<TData>],
  /** Editing a row has started (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStarted` will be fired for each individual cell. Only fires when doing Full Row Editing.
   */
  'rowEditingStarted': [event: RowEditingStartedEvent<TData>],
  /** Editing a row has stopped (when row editing is enabled). When row editing, this event will be fired once and `cellEditingStopped` will be fired for each individual cell. Only fires when doing Full Row Editing.
   */
  'rowEditingStopped': [event: RowEditingStoppedEvent<TData>],
  /** Undo operation has started.
   */
  'undoStarted': [event: UndoStartedEvent<TData>],
  /** Undo operation has ended.
   */
  'undoEnded': [event: UndoEndedEvent<TData>],
  /** Redo operation has started.
   */
  'redoStarted': [event: RedoStartedEvent<TData>],
  /** Redo operation has ended.
   */
  'redoEnded': [event: RedoEndedEvent<TData>],
  /** Cell selection delete operation (cell clear) has started.
   */
  'cellSelectionDeleteStart': [event: CellSelectionDeleteStartEvent<TData>],
  /** Cell selection delete operation (cell clear) has ended.
   */
  'cellSelectionDeleteEnd': [event: CellSelectionDeleteEndEvent<TData>],
  /** Range delete operation (cell clear) has started.
   *
   * @deprecated v32.2 Use `onCellSelectionDeleteStart` instead
   */
  'rangeDeleteStart': [event: RangeDeleteStartEvent<TData>],
  /** Range delete operation (cell clear) has ended.
   *
   * @deprecated v32.2 Use `onCellSelectionDeleteEnd` instead
   */
  'rangeDeleteEnd': [event: RangeDeleteEndEvent<TData>],
  /** Fill operation has started.
   */
  'fillStart': [event: FillStartEvent<TData>],
  /** Fill operation has ended.
   */
  'fillEnd': [event: FillEndEvent<TData>],
  /** Filter has been opened.
   */
  'filterOpened': [event: FilterOpenedEvent<TData>],
  /** Filter has been modified and applied.
   */
  'filterChanged': [event: FilterChangedEvent<TData>],
  /** Filter was modified but not applied. Used when filters have 'Apply' buttons.
   */
  'filterModified': [event: FilterModifiedEvent<TData>],
  /** Advanced Filter Builder visibility has changed (opened or closed).
   */
  'advancedFilterBuilderVisibleChanged': [event: AdvancedFilterBuilderVisibleChangedEvent<TData>],
  /** A chart has been created.
   */
  'chartCreated': [event: ChartCreatedEvent<TData>],
  /** The data range for the chart has been changed.
   */
  'chartRangeSelectionChanged': [event: ChartRangeSelectionChangedEvent<TData>],
  /** Formatting changes have been made by users through the Customize Panel.
   */
  'chartOptionsChanged': [event: ChartOptionsChangedEvent<TData>],
  /** A chart has been destroyed.
   */
  'chartDestroyed': [event: ChartDestroyedEvent<TData>],
  /** DOM event `keyDown` happened on a cell.
   */
  'cellKeyDown': [event: CellKeyDownEvent<TData> | FullWidthCellKeyDownEvent<TData>],
  /** The grid has initialised and is ready for most api calls, but may not be fully rendered yet      */
  'gridReady': [event: GridReadyEvent<TData>],
  /** Fired the first time data is rendered into the grid. Use this event if you want to auto resize columns based on their contents     */
  'firstDataRendered': [event: FirstDataRenderedEvent<TData>],
  /** The size of the grid `div` has changed. In other words, the grid was resized.
   */
  'gridSizeChanged': [event: GridSizeChangedEvent<TData>],
  /** Displayed rows have changed. Triggered after sort, filter or tree expand / collapse events.
   */
  'modelUpdated': [event: ModelUpdatedEvent<TData>],
  /** A row was removed from the DOM, for any reason. Use to clean up resources (if any) used by the row.
   */
  'virtualRowRemoved': [event: VirtualRowRemovedEvent<TData>],
  /** Which rows are rendered in the DOM has changed.
   */
  'viewportChanged': [event: ViewportChangedEvent<TData>],
  /** The body was scrolled horizontally or vertically.
   */
  'bodyScroll': [event: BodyScrollEvent<TData>],
  /** Main body of the grid has stopped scrolling, either horizontally or vertically.
   */
  'bodyScrollEnd': [event: BodyScrollEndEvent<TData>],
  /** When dragging starts. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
   */
  'dragStarted': [event: DragStartedEvent<TData>],
  /** When dragging stops. This could be any action that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
   */
  'dragStopped': [event: DragStoppedEvent<TData>],
  /** When dragging is cancelled stops. This is caused by pressing `Escape` while dragging elements within the grid that uses the grid's Drag and Drop service, e.g. Column Moving, Column Resizing, Range Selection, Fill Handle, etc.
   */
  'dragCancelled': [event: DragCancelledEvent<TData>],
  /** Grid state has been updated.
   */
  'stateUpdated': [event: StateUpdatedEvent<TData>],
  /** Triggered every time the paging state changes. Some of the most common scenarios for this event to be triggered are:
   *
   *  - The page size changes.
   *  - The current shown page is changed.
   *  - New data is loaded onto the grid.
   */
  'paginationChanged': [event: PaginationChangedEvent<TData>],
  /** A drag has started, or dragging was already started and the mouse has re-entered the grid having previously left the grid.
   */
  'rowDragEnter': [event: RowDragEnterEvent<TData>],
  /** The mouse has moved while dragging.
   */
  'rowDragMove': [event: RowDragMoveEvent<TData>],
  /** The mouse has left the grid while dragging.
   */
  'rowDragLeave': [event: RowDragLeaveEvent<TData>],
  /** The drag has finished over the grid.
   */
  'rowDragEnd': [event: RowDragEndEvent<TData>],
  /** The drag has been cancelled over the grid.
   */
  'rowDragCancel': [event: RowDragCancelEvent<TData>],
  /** A row group column was added, removed or reordered.
   */
  'columnRowGroupChanged': [event: ColumnRowGroupChangedEvent<TData>],
  /** A row group was opened or closed.
   */
  'rowGroupOpened': [event: RowGroupOpenedEvent<TData>],
  /** Fired when calling either of the API methods `expandAll()` or `collapseAll()`.
   */
  'expandOrCollapseAll': [event: ExpandOrCollapseAllEvent<TData>],
  /** Exceeded the `pivotMaxGeneratedColumns` limit when generating columns.
   */
  'pivotMaxColumnsExceeded': [event: PivotMaxColumnsExceededEvent<TData>],
  /** The client has set new pinned row data into the grid.
   */
  'pinnedRowDataChanged': [event: PinnedRowDataChangedEvent<TData>],
  /** Client-Side Row Model only. The client has updated data for the grid by either a) setting new Row Data or b) Applying a Row Transaction.
   */
  'rowDataUpdated': [event: RowDataUpdatedEvent<TData>],
  /** Async transactions have been applied. Contains a list of all transaction results.
   */
  'asyncTransactionsFlushed': [event: AsyncTransactionsFlushedEvent<TData>],
  /** A server side store has finished refreshing.
   */
  'storeRefreshed': [event: StoreRefreshedEvent<TData>],
  /** Header is focused.
   */
  'headerFocused': [event: HeaderFocusedEvent<TData>],
  /** Cell is clicked.
   */
  'cellClicked': [event: CellClickedEvent<TData>],
  /** Cell is double clicked.
   */
  'cellDoubleClicked': [event: CellDoubleClickedEvent<TData>],
  /** Cell is focused.
   */
  'cellFocused': [event: CellFocusedEvent<TData>],
  /** Mouse entered cell.
   */
  'cellMouseOver': [event: CellMouseOverEvent<TData>],
  /** Mouse left cell.
   */
  'cellMouseOut': [event: CellMouseOutEvent<TData>],
  /** Mouse down on cell.
   */
  'cellMouseDown': [event: CellMouseDownEvent<TData>],
  /** Row is clicked.
   */
  'rowClicked': [event: RowClickedEvent<TData>],
  /** Row is double clicked.
   */
  'rowDoubleClicked': [event: RowDoubleClickedEvent<TData>],
  /** Row is selected or deselected. The event contains the node in question, so call the node's `isSelected()` method to see if it was just selected or deselected.
   */
  'rowSelected': [event: RowSelectedEvent<TData>],
  /** Row selection is changed. Use the grid API `getSelectedNodes()` or `getSelectedRows()` to get the new list of selected nodes / row data.
   */
  'selectionChanged': [event: SelectionChangedEvent<TData>],
  /** Cell is right clicked.
   */
  'cellContextMenu': [event: CellContextMenuEvent<TData>],
  /** A change to range selection has occurred.
   *
   * @deprecated v32.2 Use `onCellSelectionChanged` instead
   */
  'rangeSelectionChanged': [event: RangeSelectionChangedEvent<TData>],
  /** A change to cell selection has occurred.
   */
  'cellSelectionChanged': [event: CellSelectionChangedEvent<TData>],
  /** A tooltip has been displayed     */
  'tooltipShow': [event: TooltipShowEvent<TData>],
  /** A tooltip was hidden     */
  'tooltipHide': [event: TooltipHideEvent<TData>],
  /** Sort has changed. The grid also listens for this and updates the model.
   */
  'sortChanged': [event: SortChangedEvent<TData>],
// @END_EVENTS@

  'update:modelValue': [ event: TData[]],
  'modelValue': [ event: TData[]]
}>();

const props = withDefaults(defineProps<Props<TData, TColDef>>(),  getProps<TData, TColDef>());

const convertToRaw = (value: any) => (value ? (Object.isFrozen(value) ? value : markRaw(toRaw(value))) : value);

const rootRef = useTemplateRef<HTMLDivElement>('root')

const api: Ref<GridApi | undefined> = ref(undefined);
const gridCreated: Ref<boolean> = ref(false);
const isDestroyed: Ref<boolean> = ref(false);
const gridReadyFired: Ref<boolean> = ref(false);
const batchChanges: Ref<{ [key: string]: any }> = ref({});
const batchTimeout: Ref<number | null> = ref(null);
const rowDataModel = defineModel<TData[]>();
// const rowDataModel = defineModel({default: reactive([])});

watch(rowDataModel, (newValue: any, oldValue: any) => {
  if (gridCreated.value) {
    processChanges('rowData', newValue, oldValue)
  }
}, { deep: true });

const checkForBindingConflicts = () => {
  if ((props.rowData  || props.gridOptions.rowData) && rowDataModel.value) {
    _warn(232);
  }
}

const getRowDataBasedOnBindings = () => {
  return rowDataModel.value || props.rowData || props.gridOptions.rowData;
}

const getRowData = (): TData[] => {
  const rowData: any[] = [];
  api?.value!.forEachNode((rowNode: IRowNode) => {
    rowData.push(rowNode.data);
  });
  return rowData;
}

const emitRowModel = debounce(() => {
  emits('update:modelValue', getRowData());
}, 20);

const updateModelIfUsed = (eventType: string) => {
  if (gridReadyFired.value && ROW_DATA_EVENTS.has(eventType)) {
      emitRowModel();
  }
}
const globalEventListenerFactory = (restrictToSyncOnly?: boolean) => {
  return (eventType: AgEventType) => {
    if (isDestroyed.value) {
      return;
    }

    if (eventType === 'gridReady') {
      gridReadyFired.value = true;
    }

    const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
    if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
      return;
    }

    updateModelIfUsed(eventType);
  };
}

const processChanges = (propertyName: string, currentValue: any, previousValue: any) => {
  if (gridCreated.value) {
    let value = currentValue.value || currentValue;
    if (propertyName === 'rowData' && value != undefined) {
      // Prevent the grids internal edits from being reactive
      value = convertToRaw(value);
    }

    batchChanges.value[propertyName] = value;
    if (batchTimeout.value == null) {
      batchTimeout.value = window.setTimeout(() => {
        // Clear the timeout before processing the changes in case processChanges triggers another change.
        batchTimeout.value = null;
        _processOnChange(batchChanges.value, api.value!);
        batchChanges.value = {};
      }, 0);
    }
  }
}

const propsAsRefs = toRefs<any>(props);
_ALL_GRID_OPTIONS
    .filter((propertyName: string) => propertyName != 'gridOptions') // dealt with in AgGridVue itself
    .forEach((propertyName: string) => {
      watch(() => propsAsRefs[propertyName],
          (oldValue: any, newValue: any) => {
            processChanges(propertyName, oldValue, newValue);
          },
          {deep: true})
    })

onMounted(() => {
  const gridParams = {
    globalEventListener: globalEventListenerFactory().bind(this),
    globalSyncEventListener: globalEventListenerFactory(true).bind(this),
    // frameworkOverrides: new VueFrameworkOverrides(this),
    // providedBeanInstances: {
    //   frameworkComponentWrapper,
    // },
    modules: props.modules
  };

  const gridOptions = markRaw(
      _combineAttributesAndGridOptions(toRaw(props.gridOptions), props, [
        ..._ALL_GRID_OPTIONS,
        ..._ALL_EVENTS.map((event) => _getCallbackForEvent(event)),
      ])
  );

  const rowData = getRowDataBasedOnBindings();
  if (rowData !== undefined) {
    gridOptions.rowData = convertToRaw(rowData);
  }

  api.value = createGrid(rootRef.value!, gridOptions, gridParams);
  gridCreated.value = true;

})
</script>

<template>
  <div ref="root"></div>
</template>

<style scoped>
</style>
