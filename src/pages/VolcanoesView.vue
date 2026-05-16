<template>
  <div class="volcanoes-view">
    <NavBar :transparent="false" />

    <main class="volcanoes-layout">
      <VolcanoSidebar 
        :selected-volcano-id="selectedVolcanoId" 
        @select="selectVolcano" 
        @loaded="onSidebarLoaded" 
      />

      <!-- Main Content: Selected Volcano Details -->
      <div class="volcanoes-main-content">
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
                  @click="selectTab('general')"
                >
                  Información General
                </button>
                <span class="tab-divider">|</span>
                <button 
                  class="tab-btn" 
                  :class="{ 'tab-btn--active': activeTab === 'tourist' }"
                  @click="selectTab('tourist')"
                >
                  Información Turística
                </button>
                <span class="tab-divider">|</span>
                <button 
                  class="tab-btn" 
                  :class="{ 'tab-btn--active': activeTab === 'guides' }"
                  @click="selectTab('guides')"
                >
                  Guías Locales
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
                      <div class="coords-text">
                        {{ selectedVolcano.latitude != null && selectedVolcano.longitude != null 
                          ? `${selectedVolcano.latitude}, ${selectedVolcano.longitude}` 
                          : '-' }}
                      </div>
                      <a 
                        v-if="selectedVolcano.latitude != null && selectedVolcano.longitude != null"
                        :href="`https://www.google.com/maps?q=${selectedVolcano.latitude},${selectedVolcano.longitude}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="map-link"
                      >
                        Ver en Google Maps
                      </a>
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
                  <div v-if="loadingTourist" class="loading-state">Cargando información turística...</div>
                  <div v-else-if="errorTourist" class="error-state">Error al cargar la información turística.</div>
                  <div v-else-if="touristInfo" class="info-table">
                    <template v-for="field in touristFields" :key="field.key">
                      <div class="info-row" v-if="touristInfo[field.key] !== undefined && touristInfo[field.key] !== null">
                        <div class="info-label">{{ field.label }}</div>
                        <div class="info-value">
                          <template v-if="typeof touristInfo[field.key] === 'boolean'">
                            <span v-if="touristInfo[field.key]" class="icon-check">✔️</span>
                            <span v-else class="icon-cross">❌</span>
                          </template>
                          <template v-else>
                            {{ touristInfo[field.key] }}
                          </template>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div v-else>
                    <p>No hay información turística disponible para este volcán en este momento.</p>
                  </div>
                </div>
                <div v-else-if="activeTab === 'guides'" class="guides-info">
                  <div v-if="loadingGuides" class="loading-state">Cargando guías locales...</div>
                  <div v-else-if="errorGuides" class="error-state">Error al cargar los guías locales.</div>
                  <div v-else-if="guidesList && guidesList.length > 0" class="guides-table-container">
                    <table class="guides-table">
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Whatsapp</th>
                          <th>Enlace</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="guide in guidesList" :key="guide.guideId">
                          <td>{{ guide.guideName }}</td>
                          <td>
                            {{ guide.guideWhatsapp }}
                            <a :href="`https://wa.me/${guide.guideWhatsapp.replace(/\D/g, '')}`" target="_blank" rel="noopener noreferrer" style="margin-left: 8px; text-decoration: none; display: inline-flex; align-items: center;" title="Contactar por WhatsApp">
                              <img :src="whatsappIcon" alt="WhatsApp" width="18" height="18" />
                            </a>
                          </td>
                          <td><a href="#" style="text-decoration: underline; color: var(--primary-color, #2c3e50);">más información</a></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else>
                    <p>No hay guías locales disponibles para este volcán en este momento.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import VolcanoSidebar from '@/components/VolcanoSidebar.vue';
import { getVolcanoById, getVolcanoTourism, getVolcanoGuides } from '@/services/volcanoService';
import whatsappIcon from '@/assets/icons/whatsapp.svg';
import './VolcanoesView.css';

const route = useRoute();
const router = useRouter();

// State
const selectedVolcanoId = ref(null);
const selectedVolcano = ref(null);
const loadingDetails = ref(false);
const errorDetails = ref(false);

const activeTab = ref('general');

const touristInfo = ref(null);
const loadingTourist = ref(false);
const errorTourist = ref(false);

const guidesList = ref([]);
const loadingGuides = ref(false);
const errorGuides = ref(false);

const touristFields = [
  { key: 'accessDifficulty', label: 'Dificultad de Acceso' },
  { key: 'hikingTrail', label: 'Sendero' },
  { key: 'guidedTourRequired', label: 'Guía Requerido' },
  { key: 'entranceFeeUsd', label: 'Costo de Entrada (USD)' },
  { key: 'bestSeason', label: 'Mejor Temporada' },
  { key: 'nearestCity', label: 'Ciudad más Cercana' },
  { key: 'distanceToCityKm', label: 'Distancia a la Ciudad (km)' },
  { key: 'visitDurationHrs', label: 'Duración de la Visita (hrs)' },
  { key: 'parking', label: 'Parqueo' },
  { key: 'restrooms', label: 'Sanitarios' },
  { key: 'visitorCenter', label: 'Centro de Visitantes' },
  { key: 'campingAllowed', label: 'Se Permite Acampar' },
  { key: 'foodNearby', label: 'Comida Cercana' },
  { key: 'currentAlertLevel', label: 'Nivel de Alerta Actual' },
  { key: 'emergencyContact', label: 'Contacto de Emergencia' },
  { key: 'details', label: 'Detalles Adicionales' }
];

// Actions
const onSidebarLoaded = (data) => {
  if (route.params.id) {
    selectVolcano(Number(route.params.id));
  } else if (data.length > 0) {
    selectVolcano(data[0].id);
  }
};

const selectTab = async (tab) => {
  activeTab.value = tab;
  if (tab === 'tourist' && selectedVolcanoId.value && !touristInfo.value) {
    loadingTourist.value = true;
    errorTourist.value = false;
    try {
      touristInfo.value = await getVolcanoTourism(selectedVolcanoId.value);
    } catch (err) {
      console.error(err);
      errorTourist.value = true;
    } finally {
      loadingTourist.value = false;
    }
  } else if (tab === 'guides' && selectedVolcanoId.value && guidesList.value.length === 0) {
    loadingGuides.value = true;
    errorGuides.value = false;
    try {
      guidesList.value = await getVolcanoGuides(selectedVolcanoId.value);
    } catch (err) {
      console.error(err);
      errorGuides.value = true;
    } finally {
      loadingGuides.value = false;
    }
  }
};

const selectVolcano = async (id) => {
  if (!id) return;
  
  selectedVolcanoId.value = id;
  activeTab.value = 'general';
  touristInfo.value = null;
  errorTourist.value = false;
  guidesList.value = [];
  errorGuides.value = false;
  
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
// (Handled by VolcanoSidebar's loaded event)

// Watch route changes (if user clicks back/forward)
watch(() => route.params.id, (newId) => {
  if (newId && Number(newId) !== selectedVolcanoId.value) {
    selectVolcano(Number(newId));
  }
});

</script>
