<template>
  <div class="sidebar-wrapper">
    <div class="sidebar-toggle-wrapper">
      <button class="sidebar-toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
        {{ isSidebarOpen ? 'Ocultar lista de volcanes' : 'Ver lista de volcanes' }}
      </button>
    </div>

    <aside :class="['volcanoes-sidebar', { 'volcanoes-sidebar--open': isSidebarOpen }]">
      <div v-if="loadingList" class="sidebar-loading">Cargando volcanes...</div>
      <div v-else-if="errorList" class="sidebar-error">Error al cargar la lista.</div>
      
      <template v-else>
        <div v-for="(volcanoes, region) in groupedVolcanoes" :key="region" class="region-group">
          <h3 class="region-title">{{ region }}</h3>
          <ul class="region-list">
            <li v-for="volcano in volcanoes" :key="volcano.id">
              <button 
                class="volcano-btn" 
                :class="{ 'volcano-btn--active': selectedVolcanoId === volcano.id }"
                @click="onSelect(volcano.id)"
              >
                {{ volcano.name }}
              </button>
            </li>
          </ul>
        </div>
      </template>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getVolcanoes } from '@/services/volcanoService';
import './VolcanoSidebar.css';

const props = defineProps({
  selectedVolcanoId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['select', 'loaded']);

const loadingList = ref(true);
const errorList = ref(false);
const allVolcanoes = ref([]);
const isSidebarOpen = ref(false);

const groupedVolcanoes = computed(() => {
  const groups = {};
  allVolcanoes.value.forEach(v => {
    const region = v.region || 'Sin Región';
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(v);
  });
  return groups;
});

onMounted(async () => {
  loadingList.value = true;
  errorList.value = false;
  try {
    const data = await getVolcanoes({ size: 100 });
    allVolcanoes.value = data;
    emit('loaded', data);
  } catch (err) {
    console.error(err);
    errorList.value = true;
  } finally {
    loadingList.value = false;
  }
});

const onSelect = (id) => {
  emit('select', id);
};
</script>
