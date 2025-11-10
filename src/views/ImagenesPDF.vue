<template>
  <div class="container py-5 page-container">
    <!-- Título -->
    <div class="text-center mb-5">
      <h2 class="fw-bold text-primary mb-2">🖨️ Imprimir varias imágenes</h2>
      <p class="text-muted mb-0">
        Carga tus imágenes, revisa la vista previa y genera tus archivos PDF.
      </p>
    </div>

    <!-- Subir imágenes -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title text-secondary mb-3">
          <i class="bi bi-upload me-2"></i>Agregar imágenes
        </h5>

        <input
          type="file"
          multiple
          accept="image/*"
          class="form-control mb-2"
          @change="onFileChange"
        />

        <div class="form-text">
          Puedes agregar más imágenes o eliminar las que ya no necesites.
        </div>
      </div>
    </div>

    <!-- Galería -->
    <div v-if="images.length" class="row g-4">
      <div
        v-for="(img, index) in images"
        :key="img.id"
        class="col-6 col-md-4 col-lg-3"
      >
        <div class="card shadow-sm h-100 border-0 position-relative hover-card">
          <img
            :src="img.url"
            class="card-img-top p-2 bg-light"
            alt="Vista previa"
          />
          <div class="card-body text-center py-2">
            <p class="small text-muted text-truncate mb-0">{{ img.name }}</p>
          </div>

          <button
            aria-label="Eliminar imagen"
            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
            @click="removeImage(index)"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="alert alert-light border mt-4 text-center shadow-sm">
      <i class="bi bi-images text-secondary fs-4 me-2"></i>
      No hay imágenes cargadas actualmente.
    </div>

    <!-- Botones de acción -->
    <div v-if="images.length" class="mt-5 text-center">
      <div class="actions mt-5 text-center">
        <button @click="generateOnePdfPerImage" class="btn btn-primary">
          <i class="bi bi-file-earmark-pdf me-2"></i>Un PDF por imagen
        </button>

        <button @click="generateSinglePdf" class="btn btn-success">
          <i class="bi bi-collection me-2"></i>Un solo PDF con todas
        </button>

        <button @click="printPdfDirectly" class="btn btn-warning text-dark">
          <i class="bi bi-printer me-2"></i>Imprimir directamente
        </button>

        <button @click="clearAll" class="btn btn-outline-danger">
          <i class="bi bi-trash me-2"></i>Vaciar todo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import jsPDF from "jspdf";

const images = ref([]);

// Leer desde localStorage
onMounted(() => {
  const stored = localStorage.getItem("imagenes_pdf");
  if (stored) {
    try {
      images.value = JSON.parse(stored);
    } catch {
      images.value = [];
      localStorage.removeItem("imagenes_pdf");
    }
  }
});

// Guardar automáticamente
watch(
  images,
  (val) => {
    localStorage.setItem("imagenes_pdf", JSON.stringify(val));
  },
  { deep: true }
);

// Cargar imágenes
const onFileChange = (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (event) => {
      images.value.push({
        id: crypto.randomUUID(),
        name: file.name,
        url: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  }
  e.target.value = null;
};

// Eliminar una imagen
const removeImage = (index) => {
  images.value.splice(index, 1);
};

// Vaciar todo
const clearAll = () => {
  images.value = [];
  localStorage.removeItem("imagenes_pdf");
};

// Cargar imagen para escalado
const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });

// Escalar dentro del A4
const getScaledDimensions = (img, maxWidth, maxHeight) => {
  const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
  return { width: img.width * ratio, height: img.height * ratio };
};

// Un PDF por imagen
const generateOnePdfPerImage = async () => {
  for (const [index, img] of images.value.entries()) {
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height
    );

    pdf.save(`imagen_${index + 1}.pdf`);
  }
};

// Un solo PDF con todas
const generateSinglePdf = async () => {
  if (!images.value.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });

  for (let i = 0; i < images.value.length; i++) {
    const img = images.value[i];
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height
    );

    if (i < images.value.length - 1) pdf.addPage();
  }

  pdf.save("todas_imagenes_A4.pdf");
};

// Imprimir directamente
const printPdfDirectly = async () => {
  if (!images.value.length) return;

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });

  for (let i = 0; i < images.value.length; i++) {
    const img = images.value[i];
    const image = await loadImage(img.url);
    const { width, height } = getScaledDimensions(image, 210, 297);

    pdf.addImage(
      img.url,
      "JPEG",
      (210 - width) / 2,
      (297 - height) / 2,
      width,
      height
    );

    if (i < images.value.length - 1) pdf.addPage();
  }

  const blobUrl = pdf.output("bloburl");
  const win = window.open(blobUrl);
  if (win) {
    win.onload = () => {
      win.print();
    };
  }
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.page-container {
  margin-top: 80px;
}

.card-img-top {
  height: 170px;
  object-fit: contain;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
</style>
