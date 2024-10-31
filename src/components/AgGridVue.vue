<script setup lang="ts" generic="TData = any, TColDef extends ColDef<TData> = ColDef<any>">
import {
  _ALL_GRID_OPTIONS,
  _combineAttributesAndGridOptions,
  _processOnChange,
  ALWAYS_SYNC_GLOBAL_EVENTS,
  createGrid,
} from 'ag-grid-community';

// noinspection ES6UnusedImports
import type {AgEventType, ColDef, GridApi} from "ag-grid-community";

import type {Ref} from 'vue'
import {markRaw, onMounted, ref, toRaw, toRefs, useTemplateRef, watch} from 'vue';
import {getProps} from "@/components/utils";
import type {Properties, Props} from "@/components/utils";

const props = withDefaults(defineProps<Props<TData, TColDef>>(),  getProps<TData, TColDef>());

const convertToRaw = (value: any) => (value ? (Object.isFrozen(value) ? value : markRaw(toRaw(value))) : value);

const rootRef = useTemplateRef<HTMLDivElement>('root')

const api: Ref<GridApi | undefined> = ref(undefined);
const gridCreated: Ref<boolean> = ref(false);
const isDestroyed: Ref<boolean> = ref(false);
const gridReadyFired: Ref<boolean> = ref(false);
const batchChanges: Ref<{ [key: string]: any }> = ref({});
const batchTimeout: Ref<number | null> = ref(null);

const globalEventListenerFactory = (restrictToSyncOnly?: boolean) => {
  return (eventType: AgEventType) => {
    if (isDestroyed) {
      return;
    }

    if (eventType === 'gridReady') {
      gridReadyFired.value = true;
    }

    const alwaysSync = ALWAYS_SYNC_GLOBAL_EVENTS.has(eventType);
    if ((alwaysSync && !restrictToSyncOnly) || (!alwaysSync && restrictToSyncOnly)) {
      return;
    }

    // this.updateModelIfUsed(eventType);
  };
}

const processChanges = (propertyName: string, currentValueRef: any, previousValue: any) => {
  if (gridCreated.value) {
    // if (skipChange(propertyName, currentValueRef, previousValue)) {
    //   return;
    // }

    let {value} = currentValueRef;
    const options: Properties = {
      [propertyName]:
          propertyName === 'rowData'
              ? Object.isFrozen(value)
                  ? currentValueRef
                  : markRaw(toRaw(value))
              : value,
    };

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

  const gridOptionKeys = Object.entries(props)
      .filter(
          ([key, value]) =>
              !(
                  key.startsWith('_') ||
                  key == 'gridOptions' ||
                  key == 'modules'// ||
                  // value instanceof EventEmitter
              )
      )
      .map(([key]) => key);

  const options = markRaw(_combineAttributesAndGridOptions(toRaw(props.gridOptions), props, gridOptionKeys));

  api.value = createGrid(rootRef.value!, options, gridParams);
  gridCreated.value = true;

})
</script>

<template>
  <div ref="root"></div>
</template>

<style scoped>
</style>
