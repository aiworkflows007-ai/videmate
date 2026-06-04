import { LibraryItem, ActiveTask } from './types';

export const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: 'lib-1',
    title: 'Neon Pulse - Future Beats Vol 1',
    type: 'video',
    size: '245 MB',
    duration: '12:45',
    dateString: '2 hours ago',
    quality: '4K',
    platform: 'youtube',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAv1GepoSFlkBlNXgrXeYQNKxnYODap9ChSTbSCfnGcCCDElFqEA83mVTL0p0G1J4h3fA-WhaHQbUV09SxWj3wqRMKT8ENZStQONBlfDElM44qnH9Dlju4SOkSJDDdpa_cgBxeUvoB4frU_EU-NcZMzl9rL0xKr-wGbkmSQeikpFGQQ5m9fLv5i_JcnjVVAB0QgAjUHhYOVGUAmknrhSmCcZHSu-gKQ69EzOSg97PFLt-c5xRnhWNepkcWq3pegDN3WtKfwi8JwTRE',
    category: 'Videos / Music'
  },
  {
    id: 'lib-2',
    title: 'Midnight City Drive - Synthwave',
    type: 'audio',
    size: '8 MB',
    duration: '03:22',
    dateString: 'Yesterday',
    quality: 'MP3',
    platform: 'other',
    thumbnailUrl: '', // Audio placeholder
    category: 'Audio / Relax'
  },
  {
    id: 'lib-3',
    title: 'Nature ASMR - Mountain Morning',
    type: 'video',
    size: '112 MB',
    duration: '05:10',
    dateString: '3 days ago',
    quality: '1080P',
    platform: 'youtube',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1KZ6KJgGLo6cZjMif7OJBQ4QfXIETLy-YhPMDt3b0YTyWbhM29USorWyP_GMz9oHiW1QMJcgyONLMr3qIyB88TL7cw2WIXe3mlMjupDZ5qELtxp8fZ82vo3O_HCuOys2ZexE4SpCni6XLUX3D__LD58THC56pCqOhGu8eMzbxPn-gpOzJHA4IV-Q8R5PfOaGEtbFL8MiaSJMtG4YLBcc9gIn3TIRQmuFl4UE0mXcxoTT9av_Tg_vB83D8Nh65w4x1HPprcojQE_U',
    category: 'Videos / Nature'
  },
  {
    id: 'lib-4',
    title: 'Ultimate PC Build Guide 2024',
    type: 'video',
    size: '1.2 GB',
    duration: '45:20',
    dateString: '1 week ago',
    quality: '4K',
    platform: 'vimeo',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQRhPvmPDuaMPJVwYE-Q31IpEd0pRpM-XDt4yeTkfosVY91OZzCiIFDHDVtVRuAt75iEkHXRfQmWxjvN-ZsIvHk_TgkUGUJTySNC3mqyCsFVz4Yw3f9hGJXqiFNZZeB1aq6lIcQPGBC9cR-UcagcH0faQVQ4JOG-2dq-dcLDovPh-njmEDOilZ3x-qQSsPCcn4WZPerP2t2AgBKEtlfVKOdMitWW-WlOQ585oV8mGmg38YwsunuRjLGo1YbRl7S4NVWF3rNR4D_4Y',
    category: 'Videos / Tech'
  },
  {
    id: 'lib-5',
    title: 'Coding Lounge - Chill Beats',
    type: 'video',
    size: '420 MB',
    duration: '1:45:00',
    dateString: 'Yesterday',
    quality: '1080P',
    platform: 'youtube',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgHk181rdKfNFNQDR5AxwDez8i6o73rHJaC8DSKN7QQCy9XxcjF3qlIg87m5TJ2W_FcqPqDnPF0X4mNCjA37i_bmuRnCh6-_bro41qzDh1qMnVqVgIJVY9xRFTUH-z3g7uuUbuCInQbRAlcK0jkxz97THLb5zMD7qbCvLqp820UoTLxjGxB8KKcc0gWID6APQme3-b2j4ohs2tH-K09Za2TekNT7hQYl0WaG7kriqmn2TPm8XwIXFIpixVhcEejPnerOeTfdbKTRI',
    category: 'Videos / Chill'
  },
  {
    id: 'lib-6',
    title: 'Earth from Space HDR',
    type: 'video',
    size: '2.1 GB',
    duration: '10:15',
    dateString: '2 days ago',
    quality: '4K',
    platform: 'other',
    thumbnailUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEwW4mVdRxvB40T2UkDo_FVtllhOSoRXum3TjUqcT1iMGoPMixXwY8xvjugTqkKRZY9laW8b4Kxm6bgUCDb8hzG4ZKsJP2q78fyuwCzl0d8DZtmaO7b5JcQ_5vHfWB695KrTlukgrclWJtStqMSaaoCcTvvk3mTeTuUX-G1SQs83zj8osJmBONhOCSmjfmo9u9P4VJNAltIjgmJThMli_XeSTU_tUGjQBY0VUtLGV1mODk18StiIwyrMLXpMG_6ranKZDgbM4Ca9s',
    category: 'Videos / Space'
  }
];

export const INITIAL_ACTIVE_TASKS: ActiveTask[] = [];

export const SUPPORTED_PLATFORMS = [
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: '#ff0000', exampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E1306C', exampleUrl: 'https://www.instagram.com/p/C_sample_post/' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music', color: '#38BDF8', exampleUrl: 'https://www.tiktok.com/@creative/video/123456789' },
  { id: 'twitter', name: 'Twitter', icon: 'TwitterIcon', color: '#ffffff', exampleUrl: 'https://twitter.com/spacex/status/987654321' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2', exampleUrl: 'https://www.facebook.com/watch/?v=1122334455' },
  { id: 'vimeo', name: 'Vimeo', icon: 'Video', color: '#1ab7ea', exampleUrl: 'https://vimeo.com/847321659' }
] as const;
