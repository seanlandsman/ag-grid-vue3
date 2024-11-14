<script setup lang="ts" generic="TData = any, TColDef extends ColDef<TData> = ColDef<any>">
// @START_IMPORTS@
// noinspection ES6UnusedImports
import type {
  GridApi
} from "ag-grid-community";
// @END_IMPORTS@

// noinspection ES6UnusedImports
import type {
  AgEventType,
  ColDef,
  GridOptions,
  IRowNode
} from 'ag-grid-community';

import {
  _ALL_EVENTS,
  _ALL_GRID_OPTIONS,
  _combineAttributesAndGridOptions,
  _getCallbackForEvent,
  _processOnChange,
  _warn,
  ALWAYS_SYNC_GLOBAL_EVENTS,
  createGrid
} from 'ag-grid-community';

import type {Ref} from 'vue'
import {getCurrentInstance, markRaw, onMounted, ref, toRaw, toRefs, useTemplateRef, watch} from 'vue';
import type {Props} from "@/components/utils";
import {debounce, deepToRaw, getProps} from "@/components/utils";
import {VueFrameworkOverrides} from "@/components/VueFrameworkOverrides";
import {VueFrameworkComponentWrapper} from "@/components/VueFrameworkComponentWrapper";

const ROW_DATA_EVENTS: Set<string> = new Set(['rowDataUpdated', 'cellValueChanged', 'rowValueChanged']);
const emits = defineEmits<{
// @START_EVENTS@
// @END_EVENTS@
  'update:modelValue': [event: TData[]]
}>();

const props = withDefaults(defineProps<Props<TData, TColDef>>(), getProps<TData, TColDef>());

const rootRef = useTemplateRef<HTMLDivElement>('root')

const api: Ref<GridApi | undefined> = ref(undefined);
const gridCreated: Ref<boolean> = ref(false);
const isDestroyed: Ref<boolean> = ref(false);
const gridReadyFired: Ref<boolean> = ref(false);
const batchChanges: Ref<{ [key: string]: any }> = ref({});
const batchTimeout: Ref<number | null> = ref(null);
const rowDataModel = defineModel<TData[]>();
const rowDataUpdating: Ref<boolean> = ref(false);

watch(rowDataModel, (newValue: any, oldValue: any) => {
  if (gridCreated.value) {
    rowDataUpdating.value = true;
    processChanges('rowData', deepToRaw(newValue), deepToRaw(oldValue));
  }
}, {deep: true});

const checkForBindingConflicts = () => {
  if ((props.rowData || props.gridOptions.rowData) && rowDataModel.value) {
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
  // emits('update:modelValue', deepToRaw<TData[]>(getRowData()));
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

    if (ROW_DATA_EVENTS.has(eventType)) {
      if (!rowDataUpdating.value) {
        updateModelIfUsed(eventType);
      }
      rowDataUpdating.value = false;
    }
  };
}

const processChanges = (propertyName: string, currentValue: any, previousValue: any) => {
  if (gridCreated.value) {
    let value = currentValue.value || currentValue;
    if (propertyName === 'rowData' && value != undefined) {
      // Prevent the grids internal edits from being reactive
      value = deepToRaw<TData[]>(value);
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


/* components */
const getProvides = () => {
  return Object.create((getCurrentInstance() as any).provides);
}
/* components */


onMounted(() => {
  const frameworkComponentWrapper = new VueFrameworkComponentWrapper(getCurrentInstance(), getProvides());

  const gridParams = {
    globalEventListener: globalEventListenerFactory().bind(this),
    globalSyncEventListener: globalEventListenerFactory(true).bind(this),
    frameworkOverrides: new VueFrameworkOverrides(getCurrentInstance()),
    providedBeanInstances: {
      frameworkComponentWrapper
    },
    modules: props.modules
  };

  const gridOptions = markRaw(
      _combineAttributesAndGridOptions(deepToRaw<GridOptions<TData>>(props.gridOptions), props, [
        ..._ALL_GRID_OPTIONS,
        ..._ALL_EVENTS.map((event) => _getCallbackForEvent(event)),
      ])
  );

  const rowData = getRowDataBasedOnBindings();
  if (rowData !== undefined) {
    gridOptions.rowData = deepToRaw(rowData as TData[]);
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
