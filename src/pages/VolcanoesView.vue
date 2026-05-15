<template>
  <div class="volcanoes-view">
    <NavBar :transparent="false" />

    <main class="volcanoes-layout">
      <!-- Loading / Error states for main list -->
      <div v-if="loadingList" class="loading-state">Cargando volcanes...</div>
      <div v-else-if="errorList" class="error-state">Error al cargar la lista de volcanes.</div>

      <template v-else>
        <div class="sidebar-toggle-wrapper">
          <button class="sidebar-toggle-btn" @click="isSidebarOpen = !isSidebarOpen">
            {{ isSidebarOpen ? 'Ocultar lista de volcanes' : 'Ver lista de volcanes' }}
          </button>
        </div>

        <!-- Sidebar: Regions and Volcanoes -->
        <aside :class="['volcanoes-sidebar', { 'volcanoes-sidebar--open': isSidebarOpen }]">
          <div v-for="(volcanoes, region) in groupedVolcanoes" :key="region" class="region-group">
            <h3 class="region-title">{{ region }}</h3>
            <ul class="region-list">
              <li v-for="volcano in volcanoes" :key="volcano.id">
                <button 
                  class="volcano-btn" 
                  :class="{ 'volcano-btn--active': selectedVolcanoId === volcano.id }"
                  @click="selectVolcano(volcano.id)"
                >
                  {{ volcano.name }}
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <!-- Main Content: Selected Volcano Details -->
        <div class="volcanoes-main-content" @click="isSidebarOpen = false">
          <section v-if="selectedVolcanoId" class="volcano-details">
            <div v-if="loadingDetails" class="loading-state">Cargando detalles...</div>
            <div v-else-if="errorDetails" class="error-state">Error al cargar los detalles del volcán.</div>
            
            <div v-else-if="selectedVolcano" class="details-container">
              <h1 class="details-title">{{ selectedVolcano.name }}</h1>
              
              <div class="details-image-wrapper">
                <img 
                  v-if="selectedVolcano.imageUrl" 
                  :src="selectedVolcano.imageUrl" 
                  :alt="selectedVolcano.name" 
                  class="details-image" 
                />
                <div v-else class="details-image-fallback">
                  <span>Fotografía no disponible</span>
                </div>
              </div>

              <div class="details-tabs">
                <button 
                  class="tab-btn" 
                  :class="{ 'tab-btn--active': activeTab === 'general' }"
                  @click="activeTab = 'general'"
                >
                  Información General
                </button>
                <span class="tab-divider">|</span>
                <button 
                  class="tab-btn" 
                  :class="{ 'tab-btn--active': activeTab === 'tourist' }"
                  @click="activeTab = 'tourist'"
                >
                  Información Turística
                </button>
              </div>

              <div class="details-content">
                <div v-if="activeTab === 'general'" class="info-table">
                  <div class="info-row">
                    <div class="info-label">País</div>
                    <div class="info-value">{{ selectedVolcano.country || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Región</div>
                    <div class="info-value">{{ selectedVolcano.region || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Coordenadas</div>
                    <div class="info-value">
                      {{ selectedVolcano.latitude != null && selectedVolcano.longitude != null 
                        ? `${selectedVolcano.latitude}, ${selectedVolcano.longitude}` 
                        : '-' }}
                    </div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Altura</div>
                    <div class="info-value">{{ selectedVolcano.elevationM ? `${selectedVolcano.elevationM} m s.n.m.` : '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Tipo</div>
                    <div class="info-value">{{ selectedVolcano.type || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Estado</div>
                    <div class="info-value">{{ selectedVolcano.status || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Ultima Erupción</div>
                    <div class="info-value">{{ selectedVolcano.lastEruption || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">VEI*</div>
                    <div class="info-value">{{ selectedVolcano.vei || '-' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Victimas</div>
                    <div class="info-value">{{ selectedVolcano.casualties || '0' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Monitoreado</div>
                    <div class="info-value">{{ selectedVolcano.monitored ? 'Sí' : 'No' }}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Información</div>
                    <div class="info-value">{{ selectedVolcano.description || '-' }}</div>
                  </div>
                </div>
                <div v-else-if="activeTab === 'tourist'" class="tourist-info">
                  <p>
                    {{ selectedVolcano.description || 'No hay información turística disponible para este volcán en este momento.' }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </template>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { getVolcanoes, getVolcanoById } from '@/services/volcanoService';
import './VolcanoesView.css';

const route = useRoute();
const router = useRouter();

// State
const loadingList = ref(true);
const errorList = ref(false);
const allVolcanoes = ref([]);

const selectedVolcanoId = ref(null);
const selectedVolcano = ref(null);
const loadingDetails = ref(false);
const errorDetails = ref(false);

const activeTab = ref('general');
const isSidebarOpen = ref(false);

// Computed
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

// Actions
const loadVolcanoes = async () => {
  loadingList.value = true;
  errorList.value = false;
  try {
    const data = await getVolcanoes({ size: 100 });
    allVolcanoes.value = data;
    
    // Auto-select volcano
    if (route.params.id) {
      selectVolcano(Number(route.params.id));
    } else if (data.length > 0) {
      selectVolcano(data[0].id);
    }
  } catch (err) {
    console.error(err);
    errorList.value = true;
  } finally {
    loadingList.value = false;
  }
};

const selectVolcano = async (id) => {
  if (!id) return;
  
  selectedVolcanoId.value = id;
  activeTab.value = 'general';
  isSidebarOpen.value = false;
  
  // Update route without triggering full reload if it's different
  if (Number(route.params.id) !== id) {
    router.replace({ name: 'Volcanoes', params: { id } });
  }

  loadingDetails.value = true;
  errorDetails.value = false;
  try {
    const details = await getVolcanoById(id);
    selectedVolcano.value = details;
  } catch (err) {
    console.error(err);
    errorDetails.value = true;
  } finally {
    loadingDetails.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadVolcanoes();
});

// Watch route changes (if user clicks back/forward)
watch(() => route.params.id, (newId) => {
  if (newId && Number(newId) !== selectedVolcanoId.value) {
    selectVolcano(Number(newId));
  }
});

</script>
