import type { TablerIconComponent } from "vue-tabler-icons";

type textCards = {
    icon: string,
    num: string,
    percent: string,
    title: string,
    shape:string
}

type profileImg = {
  img:string
}

type projectTable = {
    img: string;
    activestate: string;
    leadname: string;
    leademail: string;
    projectname: string;
    statuscolor: string;
    statustext: string;
    skill: string;
}

type ProductTable = {
  img: string;
  name: string;
  payment: string;
  paymentstatus: string;
  process: number;
  processcolor:string;
  statuscolor: string;
  statustext: string;
}


/*Table Action*/
type tableAction = {
  icon: TablerIconComponent;
  listtitle: string;
};


type LatestReview = {
  img: string;
  name: string;
  profile:string;
  customername: string;
  customeremail: string;
  review: number;
  reviewtext:string;
  statuscolor: string;
  statustext: string;
  time:string
}


export type {textCards,profileImg,projectTable,ProductTable,tableAction,LatestReview}