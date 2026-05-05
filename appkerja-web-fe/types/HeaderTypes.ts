import type { TablerIconComponent } from "vue-tabler-icons";

type notificationType = {
    avatar: string;
    title: string;
    subtitle: string;
    time:string;
};

type profileType = {
    avatar: string;
    bgcolor:string;
    title: string;
    subtitle: string;
    href: string;
};

type languageType = {
    avatar: string;
    title: string;
    subtext: string;
    value: string;
};

type appsLinkType = {
    avatar: string;
    title: string;
    subtext: string;
    href: string;
};

type quickLinksType = {
    title: string;
    href: string;
};

type searchType = {
    title: string;
    href: string;
};

type optionIcon = {
    title: string;
    iconcolor: string;
};


export type { notificationType, profileType, languageType, appsLinkType, quickLinksType,searchType,optionIcon }