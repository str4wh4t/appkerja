// project imports
import mock from '../../mockAdapter';
import user1 from '/images/profile/user1.jpg';
import user2 from '/images/profile/user2.jpg';
import user3 from '/images/profile/user3.jpg';
import user4 from '/images/profile/user4.jpg';
import user5 from '/images/profile/user5.jpg';
import user6 from '/images/profile/user6.jpg';
import user7 from '/images/profile/user-7.jpg';
import user11 from '/images/profile/user3.jpg';
import user12 from '/images/profile/user4.jpg';
import user9 from '/images/profile/user5.jpg';
import user10 from '/images/profile/user2.jpg';

// types
export type KeyedObject = {
    [key: string]: string | number | KeyedObject | any;
};

// followers list

const followers: KeyedObject[] = [
    {
        id: '#1Followers_Barney',
        avatar: user1,
        name: 'Barney',
        location: 'Handburgh',
        follow: 1
    },
    {
        id: '#2Followers_Thea',
        avatar: user2,
        name: 'Thea',
        location: 'New jana',
        follow: 2
    },
    {
        id: '#3Followers_Guiseppe',
        avatar: user3,
        name: 'Guiseppe',
        location: 'Jenkinsstad',
        follow: 1
    },
    {
        id: '#4Followers_Henderson',
        avatar: user4,
        name: 'Henderson',
        location: 'South Antonina',
        follow: 1
    },
    {
        id: '#5Followers_Maddison',
        avatar: user5,
        name: 'Maddison',
        location: 'New Dorthy',
        follow: 1
    },
    {
        id: '#6Followers_Wilber',
        avatar: user6,
        name: 'Wilber',
        location: 'Twilahsven',
        follow: 1
    },
    {
        id: '#7Followers_Hayden',
        avatar: user1,
        name: 'Hayden',
        location: 'Darrelshaire',
        follow: 1
    },
    {
        id: '#8Followers_Lloyd',
        avatar: user2,
        name: 'Lloyd',
        location: 'New Credrick',
        follow: 1
    },
    {
        id: '#9Followers_Kris',
        avatar: user3,
        name: 'Kris',
        location: 'New Dianna',
        follow: 1
    },
    {
        id: '#10Followers_Kyler',
        avatar: user4,
        name: 'Kyler',
        location: 'Murraymouth',
        follow: 1
    },
    {
        id: '#11Followers_Pamela',
        avatar: user5,
        name: 'Pamela',
        location: 'Murraymouth',
        follow: 1
    },
    {
        id: '#12Followers_Betty',
        avatar: user6,
        name: 'John Doe',
        location: 'North Zole',
        follow: 1
    },
    {
        id: '#13Followers_Anthony',
        avatar: user1,
        name: 'Anthony',
        location: 'Lake Judy',
        follow: 1
    },
    {
        id: '#14Followers_Reggie',
        avatar: user2,
        name: 'Reggie',
        location: 'Kailynland',
        follow: 1
    },
    {
        id: '#15Followers_Francesca',
        avatar: user3,
        name: 'Francesca',
        location: 'Pagacview',
        follow: 2
    },
    {
        id: '#16Followers_Carmel',
        avatar: user4,
        name: 'Carmel',
        location: 'Port Lerashire',
        follow: 1
    },
    {
        id: '#17Followers_Darwin',
        avatar: user5,
        name: 'Darwin',
        location: 'North Jacquesside',
        follow: 2
    },
    {
        id: '#18Followers_Kaylin',
        avatar: user6,
        name: 'Kaylin',
        location: 'Bergstrombury',
        follow: 1
    },
    {
        id: '#19Followers_Kamryn',
        avatar: user1,
        name: 'Kamryn',
        location: 'South Norma',
        follow: 1
    },
    {
        id: '#20Followers_Madelyn',
        avatar: user12,
        name: 'Madelyn',
        location: 'Port Opheliamouth',
        follow: 1
    }
];

// ==============================|| MOCK SERVICES ||============================== //

mock.onGet('/api/followers/list').reply(200, { followers });

// mock.onGet('/api/followers/list').reply(() => {
//     return [200, followers];
// });
