<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Icon, Map, TileLayer, LayerGroup, Marker, Control } from 'leaflet';

import 'leaflet/dist/leaflet.css';
import markerIconUrl from '@/assets/img/map_marker.svg';

const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
	'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="external noopener noreferrer">OpenStreetMap</a>';
const markerIconSize = 40;

const props = defineProps(['data', 'config']);
const container = ref(null);
const map = ref(null);

const setupMap = () => {
	if (!props.data?.lat && !props.data?.lon) {
		return;
	}

	const tiles = new TileLayer(tileUrl, {
		attribution: attribution,
		minZoom: 5,
		maxZoom: 19,
	});
	const group = new LayerGroup();
	const icon = new Icon({
		iconUrl: markerIconUrl,
		iconSize: [markerIconSize, markerIconSize],
		iconAnchor: [markerIconSize / 2, markerIconSize],
		popupAnchor: [0, markerIconSize * -1],
		clasName: 'drop-shadow-md',
	});
	const marker = new Marker(
		[
			parseFloat(props.data?.lat ?? 0.0),
			parseFloat(props.data?.lon ?? 0.0),
		],
		{
			icon: icon,
			title: props.data?.title ?? '',
		},
	);

	if ((props.data?.popupText ?? '').length > 0) {
		marker.bindPopup(props.data?.popupText);
	}

	marker.addTo(group);

	const mapConfig = {
		layers: [tiles, group],
	};

	map.value = new Map(container.value, mapConfig).setView(
		[
			parseFloat(props.data?.lat ?? 0.0),
			parseFloat(props.data?.lon ?? 0.0),
		],
		parseInt(props.data?.zoom ?? 17, 10),
	);
	map.value.attributionControl.setPrefix(false);

	const overlays = {
		Hologramas: group,
	};

	const layers = new Control.Layers(null, overlays);
	layers.addTo(map.value);

	const scale = new Control.Scale({ imperial: false, updateWhenIdle: true });
	scale.addTo(map.value);

	setTimeout(() => {
		map.value.invalidateSize();
	}, 400);
};

onMounted(() => {
	setupMap();
});

onBeforeUnmount(() => {
	if (map.value) {
		map.value.remove();
	}

	if (container.value) {
		container.value.remove();
	}
});
</script>

<template>
	<div ref="container" class="w-full h-[65vh]"></div>
</template>
