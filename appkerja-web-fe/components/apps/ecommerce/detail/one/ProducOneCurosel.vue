<script lang setup>
import { ref, computed } from 'vue';
import { useEcomStore } from '@/stores/apps/eCommerce';
import { useRoute } from 'vue-router';
import { Carousel, Slide } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';
import product1 from '/images/products/s1.jpg';
import product2 from '/images/products/s2.jpg';
import product3 from '/images/products/s3.jpg';
import product4 from '/images/products/s4.jpg';
import product5 from '/images/products/s5.jpg';
import product6 from '/images/products/s6.jpg';
import product7 from '/images/products/s7.jpg';
import product8 from '/images/products/s8.jpg';

const store = useEcomStore();
const route = useRoute();

const getDetailImage = computed(() => {
    return store.products[route.params.id - 1].image;
});

const slideShow = [
    {
        image: getDetailImage.value,
        id: 1
    },
    {
        image: product1,
        id: 2
    },
    {
        image: product2,
        id: 3
    },
    {
        image: product3,
        id: 4
    },
    {
        image: product4,
        id: 5
    },
    {
        image: product5,
        id: 6
    },
    {
        image: product6,
        id: 7
    },
    {
        image: product7,
        id: 8
    },
    {
        image: product8,
        id: 9
    }
];

const currentSlide = ref(0);
function slideTo(val) {
    currentSlide.value = val;
}


</script>

<template>
    <div>
        <Carousel id="gallery" :items-to-show="1" :wrap-around="false" v-model="currentSlide">
            <Slide v-for="(slide, i) in slideShow" :key="i">
                <div class="carousel__item">
                    <img alt="product" :src="slide.image" class="w-100 rounded-xl" />
                </div>
            </Slide>
        </Carousel>

        <Carousel id="thumbnails" class="mt-4" :currentSlide="currentSlide" :transition="500"  :items-to-show="7" :wrap-around="false"
            v-model="currentSlide" ref="carousel">
            <Slide v-for="(slide, i) in slideShow" :key="i">
                <div class="carousel__item cursor-pointer" @click="slideTo(slide.id - 1)">
                    <v-avatar  class="thumb">
                        <img alt="product" :src="slide.image"  class="rounded-circle w-100" />
                    </v-avatar>
                </div>
            </Slide>

            
            <!-- <template #addons>
                <Navigation />
            </template> -->
        </Carousel>
    </div>
</template>
<style lang="scss">
#thumbnails {
    .carousel__slide {
        border: 2px solid transparent;
        line-height: 0px;
    }
    .thumb{
            height: 75px;
            width: 75px;
            @media screen and (max-width:1024px){
                height: 50px;
                width: 50px;
            }
            @media screen and (max-width:600px){
                height: 30px;
                width: 30px;
            }
    }

    .carousel__slide--active {
        .thumb{
            border: 2px solid rgb(var(--v-theme-primary));
            img{
                padding:4px;
            }
        }
        
    }
}
</style>
