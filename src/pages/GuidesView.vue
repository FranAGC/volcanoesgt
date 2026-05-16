<template>
  <div class="volcanoes-view">
    <NavBar :transparent="false" />

    <main class="volcanoes-layout">
      <VolcanoSidebar 
        :selected-volcano-id="selectedVolcanoId" 
        @select="selectVolcano" 
        @loaded="onSidebarLoaded" 
      />

      <div class="volcanoes-main-content">
        <section v-if="selectedVolcanoId" class="volcano-details">
          <div v-if="loadingMain" class="loading-state">Cargando guías...</div>
          <div v-else-if="errorMain" class="error-state">Error al cargar las guías del volcán.</div>
          
          <div v-else-if="selectedVolcano" class="details-container">
            <h1 class="details-title">{{ selectedVolcano.name }}</h1>

            <!-- List of guides for this volcano -->
            <div v-if="guidesList.length > 0" class="guides-table-container">
              <table class="guides-table">
                <thead>
                  <tr>
                    <th>Título de guía</th>
                    <th>Dificultad</th>
                    <th>Distancia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="guide in guidesList" :key="guide.id" :class="{ 'active-row': selectedGuideId === guide.id }">
                    <td>{{ guide.title }}</td>
                    <td>{{ guide.difficulty }}</td>
                    <td>{{ guide.distanceKm }} kms</td>
                    <td>
                      <button class="details-link-btn" @click="selectGuideDetails(guide.id)">
                        Detalles
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Guide Details Section -->
              <div v-if="selectedGuideId" class="guide-details-section">
                <div v-if="loadingDetails" class="loading-state">Cargando detalles...</div>
                <div v-else-if="errorDetails" class="error-state">Error al cargar los detalles.</div>
                
                <div v-else-if="guideDetails" class="guide-details-content">
                  <h3 class="section-title">DETALLES</h3>
                  
                  <div class="info-table">
                    <div class="info-row">
                      <div class="info-label">Nombre del Volcán</div>
                      <div class="info-value">{{ guideDetails.volcanoName || selectedVolcano.name }}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Título</div>
                      <div class="info-value">{{ guideDetails.title }}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Dificultad</div>
                      <div class="info-value">{{ guideDetails.difficulty }}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Distancia</div>
                      <div class="info-value">{{ guideDetails.distanceKm }} kms</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Duración Estimada</div>
                      <div class="info-value">{{ guideDetails.estimatedDurationHrs }} hrs</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Punto de Partida</div>
                      <div class="info-value">{{ guideDetails.startingPointName }}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Ubicación</div>
                      <div class="info-value">
                        <div class="coords-text">
                          {{ guideDetails.startingPointLat }}, {{ guideDetails.startingPointLng }}
                        </div>
                        <a 
                          v-if="guideDetails.startingPointLat != null && guideDetails.startingPointLng != null"
                          :href="`https://www.google.com/maps?q=${guideDetails.startingPointLat},${guideDetails.startingPointLng}`"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="map-link"
                        >
                          Ver en Google Maps
                        </a>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Instrucciones</div>
                      <div class="info-value">{{ guideDetails.instructions }}</div>
                    </div>
                    <div class="info-row">
                      <div class="info-label">Equipo Recomendado</div>
                      <div class="info-value">
                        <ul v-if="guideDetails.recommendedGear && guideDetails.recommendedGear.length" class="gear-list">
                          <li v-for="(gear, index) in guideDetails.recommendedGear" :key="index">
                            {{ gear }}
                          </li>
                        </ul>
                        <span v-else>-</span>
                      </div>
                    </div>
                  </div>

                  <h3 class="section-title resources-title">RECURSOS</h3>
                  <div v-if="loadingResources" class="loading-state">Cargando recursos...</div>
                  <div v-else-if="errorResources" class="error-state">Error al cargar recursos.</div>
                  <div v-else-if="resourcesList.length > 0" class="guides-table-container">
                    <table class="guides-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Enlace</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="res in resourcesList" :key="res.id">
                          <td>{{ res.type }}</td>
                          <td>{{ res.description }}</td>
                          <td>
                            <a :href="res.srcUrl" target="_blank" rel="noopener noreferrer" class="resource-link">
                              enlace
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>
                    <p class="no-data">No hay recursos disponibles.</p>
                  </div>

                </div>
              </div>

            </div>
            <div v-else>
              <p class="no-data">No hay guías registradas para este volcán en este momento.</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import VolcanoSidebar from '@/components/VolcanoSidebar.vue';
import { 
  getSelfGuidedList, 
  getSelfGuidedById, 
  getSelfGuidedResources 
} from '@/services/volcanoService';

import './VolcanoesView.css';
import './GuidesView.css';

const route = useRoute();
const router = useRouter();

const selectedVolcanoId = ref(null);
const selectedVolcano = ref(null);
const allVolcanoesRef = ref([]);

const guidesList = ref([]);
const loadingMain = ref(false);
const errorMain = ref(false);

const selectedGuideId = ref(null);
const guideDetails = ref(null);
const loadingDetails = ref(false);
const errorDetails = ref(false);

const resourcesList = ref([]);
const loadingResources = ref(false);
const errorResources = ref(false);

const onSidebarLoaded = (data) => {
  allVolcanoesRef.value = data;
  if (route.params.id) {
    selectVolcano(Number(route.params.id));
  } else if (data.length > 0) {
    selectVolcano(data[0].id);
  }
};

const selectVolcano = async (id) => {
  if (!id) return;
  
  selectedVolcanoId.value = id;
  const volcano = allVolcanoesRef.value.find(v => v.id === id);
  selectedVolcano.value = volcano || { name: 'Volcán' };
  
  if (Number(route.params.id) !== id) {
    router.replace({ name: 'Guides', params: { id } });
  }

  // Reset guide details
  selectedGuideId.value = null;
  guideDetails.value = null;
  resourcesList.value = [];

  loadingMain.value = true;
  errorMain.value = false;
  try {
    guidesList.value = await getSelfGuidedList(id);
    if (guidesList.value.length > 0) {
      selectGuideDetails(guidesList.value[0].id);
    }
  } catch (err) {
    console.error(err);
    errorMain.value = true;
  } finally {
    loadingMain.value = false;
  }
};

const selectGuideDetails = async (id) => {
  selectedGuideId.value = id;
  loadingDetails.value = true;
  errorDetails.value = false;
  
  // Reset resources
  resourcesList.value = [];
  loadingResources.value = true;
  errorResources.value = false;

  try {
    const details = await getSelfGuidedById(id);
    guideDetails.value = details;

    // Load resources after
    try {
      resourcesList.value = await getSelfGuidedResources(id);
    } catch (err) {
      console.error(err);
      errorResources.value = true;
    } finally {
      loadingResources.value = false;
    }
    
  } catch (err) {
    console.error(err);
    errorDetails.value = true;
    loadingResources.value = false; // abort loading resources
  } finally {
    loadingDetails.value = false;
  }
};

watch(() => route.params.id, (newId) => {
  if (newId && Number(newId) !== selectedVolcanoId.value) {
    selectVolcano(Number(newId));
  }
});

</script>
