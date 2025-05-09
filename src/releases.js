import React, { useState } from "react";

const releases = [
  {
    title: "יותר מדי מילים למועדון שפיצר פליפ",
    artist: "Sighdafekt",
    type: "Single",
    smartLink: "https://sigh.ffm.to/spitzerflip",
    cover: "https://i.imgur.com/LbhIXxE.jpeg",
    date: "2025-03-01"
  },
  {
    title: "ילדה רעה",
    artist: "שלומי לקאו, Guyku, Sighdafekt",
    type: "Single",
    smartLink: "https://ffm.to/yaldaraa",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7b/f4/61/7bf461e9-1c2d-83d7-182f-5798acb9f28a/cover.jpg/600x600bb.jpg",
    date: "2025-04-01"
  },
  {
    title: "העולם מסתובב",
    artist: "Ethel",
    type: "Single",
    smartLink: "https://ethel.link/haolammistovev",
    cover: "https://i.imgur.com/WFpm26n.jpeg",
    date: "2025-05-01"
  },
  {
    title: "צלילי אהבה",
    artist: "Sighdafekt",
    type: "Album",
    smartLink: "https://sigh.ffm.to/lovesounds",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/ee/69/da/ee69da1b-efdb-785d-2146-e7bf9f33a249/cover.jpg/600x600bb.jpg",
    date: "2024-12-01"
  },
  {
    title: "לא סופר",
    artist: "סגולות, שאנן סטריט",
    type: "Single",
    smartLink: "https://ffm.to/losofer",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/61/7f/04/617f04fa-7d36-177d-2ed0-33aba22a67cb/199066440551.jpg/600x600bb.jpg",
    date: "2024-11-01"
  },
  {
    title: "שחקני קופסה",
    artist: "סגולות",
    type: "Album",
    smartLink: "https://ffm.to/sgulotalbum",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/73/e5/36/73e536b9-e7de-9aa4-f064-cec42c4465fb/199066744659.jpg/600x600bb.jpg",
    date: "2024-10-01"
  },
  {
    title: "ברבי",
    artist: "Sighdafekt ,Ethel",
    type: "Single",
    smartLink: "https://sigh.ffm.to/barbi",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/37/77/1a/37771a4f-a589-22c9-61ab-4ef7e1295f11/cover.jpg/600x600bb.jpg",
    date: "2024-06-01"
  },
  {
    title: "4 Track Live Session",
    artist: "Ethel",
    type: "Album",
    smartLink: "https://ffm.to/ethel4track",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d6/60/a4/d660a40a-cce3-f7ef-190d-ffd71cc9c528/197187370658.jpg/600x600bb.jpg",
    date: "2023-09-01"
  },
  {
    title: "אהבת אמת",
    artist: "Sighdafekt",
    type: "Single",
    smartLink: "https://sigh.ffm.to/ahavatemet",
    cover: "https://cdn-images.dzcdn.net/images/cover/00c59a34e783760ddf3fb0792e3eeed4/500x500-000000-80-0-0.jpg",
    date: "2023-03-01"
  },
  {
    title: "מחט רמיקס",
    artist: "Ethel",
    type: "Single",
    smartLink: "https://ffm.to/mahatremix",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/28/7c/95/287c9553-7944-b5e6-8e72-2e399e8f491f/197188583682.jpg/600x600bb.jpg",
    date: "2023-01-01"
  },
  {
    title: "IDKY (Backyard Live Session)",
    artist: "Kizels",
    type: "Single",
    smartLink: "https://ffm.to/idkylive",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/74/21/88/742188ee-e8a4-731a-e139-ee9e595a795f/cover.jpg/600x600bb.jpg",
    date: "2022-05-10"
  },
  {
    title: "לא ילדה טובה",
    artist: "Ethel",
    type: "Album",
    smartLink: "https://ethel.link/album",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/07/aa/89/07aa89d8-debd-598d-e9c2-267c5caaff54/196626949554.jpg/600x600bb.jpg",
    date: "2022-05-01"
  },
  {
    title: "חתולה רמיקס",
    artist: "Ethel",
    type: "Single",
    smartLink: "https://ffm.to/hatula-remix",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/e0/6a/22/e06a22a6-2129-c063-4bc2-9b8ae18268d2/196626679956.jpg/600x600bb.jpg",
    date: "2022-04-15"
  },
  {
    title: "IDKY",
    artist: "Kizels",
    type: "Single",
    smartLink: "https://ffm.to/kizels-idky",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/0d/22/05/0d22057a-9c0b-df38-076c-adce07961e31/cover.jpg/600x600bb.jpg",
    date: "2022-04-10"
  },
  {
    title: "חתולה",
    artist: "Ethel",
    type: "Single",
    smartLink: "https://ffm.to/hatula",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/60/fb/53/60fb5333-c877-c1b1-6ac3-255aa8f9cd03/196626514875.jpg/600x600bb.jpg",
    date: "2022-04-01"
  },
  {
    title: "ראשה",
    artist: "Ethel",
    type: "Single",
    smartLink: "https://ffm.to/ethel-russia",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9e/2c/31/9e2c313f-f3fa-db7f-b1e9-fea7906c089e/196292137514.jpg/600x600bb.jpg",
    date: "2022-02-01"
  },
  {
    title: "YYY EP",
    artist: "Sighdafekt",
    type: "Album",
    smartLink: "https://sigh.ffm.to/yyy",
    cover: "https://static1.squarespace.com/static/63d746c10e41a71f9fdee43c/63d74aaf29f1f824640c7ec5/63d74ac729f1f824640c95ea/1675053767606/Sighdafekt-artwork.jpeg",
    date: "2019-01-01"
  },
  {
    title: "Summers Over",
    artist: "Sighdafekt",
    type: "Single",
    smartLink: "https://sigh.ffm.to/summersover",
    cover: "https://cdn-images.dzcdn.net/images/cover/8b5701173c7838bf0677ab70c19c37b9/0x1900-000000-80-0-0.jpg",
    date: "2019-10-01"
  }
];

export default releases;

