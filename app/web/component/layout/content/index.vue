<template>
<div class="app-body" :style="{ 'margin-left': collapse?'64px':'245px' }">
        <div class="main-container">
            <router-view></router-view>
        </div>
    </div>
</template>
<script lang="ts" src="./index.ts"></script>
