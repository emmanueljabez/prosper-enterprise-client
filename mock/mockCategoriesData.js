export const categoriesData = [
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'All electronic devices and accessoriesIncluding latest tech innovations',
    parentId: null,
    level: 0,
    position: 1,
    isActive: true,
    isDefault: true,
    isFeatured: true,
    path: 'electronics',
    images: {
      icon: '/assets/categories/icons/electronics.svg',
      thumbnail: '/assets/categories/thumbnails/electronics.jpg',
      banner: '/assets/categories/banners/electronics.jpg',
      heroImage: '/assets/categories/heroes/electronics.jpg'
    },
    metadata: {
      seo: {
        metaTitle: 'Shop Electronics - Latest Gadgets & Devices',
        metaDescription: 'Explore our wide range of electronic devices including smartphones, laptops, audio gear, and accessories with special deals and fast shipping.',
        keywords: 'electronics, gadgets, smartphones, laptops, audio',
        structuredData: {
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Smartphones',
              url: '/category/electronics/smartphones'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Laptops',
              url: '/category/electronics/laptops'
            }
          ]
        }
      },
      visibility: {
        webstore: true,
        b2bPortal: true,
        pos: true,
        startDate: null,
        endDate: null
      },
      accessControl: {
        roles: ['admin', 'manager', 'sales']
      },
      analytics: {
        revenue: 245689.78,
        unitsSold: 3567,
        viewCount: 15789,
        conversion: 4.2
      },
      attributes: [
        {
          id: 'attr-1',
          name: 'Warranty',
          code: 'warranty',
          type: 'select',
          values: ['1 Year', '2 Years', '3 Years', '5 Years'],
          isInherited: true
        },
        {
          id: 'attr-2',
          name: 'Energy Rating',
          code: 'energy_rating',
          type: 'select',
          values: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D'],
          isInherited: true
        }
      ]
    },
    children: [
      {
        id: 'cat-2',
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'The latest smartphones and accessories from top brands',
        parentId: 'cat-1',
        level: 1,
        position: 1,
        isActive: true,
        isDefault: false,
        isFeatured: true,
        path: 'electronics/smartphones',
        images: {
          icon: '/assets/categories/icons/smartphones.svg',
          thumbnail: '/assets/categories/thumbnails/smartphones.jpg',
          banner: '/assets/categories/banners/smartphones.jpg',
          heroImage: '/assets/categories/heroes/smartphones.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Latest Smartphones - Best Deals on Mobile Phones',
            metaDescription: 'Shop the newest smartphones from Apple, Samsung, Google and more. Find great deals on the latest mobile phone technology.',
            keywords: 'smartphones, iphone, samsung galaxy, pixel, mobile phones',
            structuredData: {
              '@type': 'ItemList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Apple iPhones',
                  url: '/category/electronics/smartphones/apple'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Samsung Galaxy',
                  url: '/category/electronics/smartphones/samsung'
                }
              ]
            }
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true,
            startDate: null,
            endDate: null
          },
          accessControl: {
            roles: ['admin', 'manager', 'sales']
          },
          analytics: {
            revenue: 156789.45,
            unitsSold: 1235,
            viewCount: 8965,
            conversion: 5.7
          },
          attributes: [
            {
              id: 'attr-3',
              name: 'Screen Size',
              code: 'screen_size',
              type: 'select',
              values: ['4-5"', '5-6"', '6-7"', '7"+'],
              isInherited: false
            },
            {
              id: 'attr-4',
              name: 'Storage',
              code: 'storage',
              type: 'select',
              values: ['64GB', '128GB', '256GB', '512GB', '1TB'],
              isInherited: false
            }
          ]
        },
        children: [
          {
            id: 'cat-3',
            name: 'Apple iPhones',
            slug: 'apple-iphones',
            description: 'Apple iPhone models and accessories',
            parentId: 'cat-2',
            level: 2,
            position: 1,
            isActive: true,
            isDefault: false,
            isFeatured: false,
            path: 'electronics/smartphones/apple-iphones',
            images: {
              icon: '/assets/categories/icons/apple.svg',
              thumbnail: '/assets/categories/thumbnails/iphones.jpg',
              banner: '/assets/categories/banners/iphones.jpg'
            },
            metadata: {
              seo: {
                metaTitle: 'Apple iPhones - Latest Models and Accessories',
                metaDescription: 'Shop the latest Apple iPhone models including iPhone 14, iPhone 13, and iPhone SE. Find cases, chargers, and other accessories.',
                keywords: 'iphone, apple, iphone 14, iphone 13, iphone cases'
              },
              visibility: {
                webstore: true,
                b2bPortal: true,
                pos: true
              },
              analytics: {
                revenue: 98743.21,
                unitsSold: 452,
                viewCount: 4532,
                conversion: 6.2
              },
              attributes: [
                {
                  id: 'attr-5',
                  name: 'Model',
                  code: 'iphone_model',
                  type: 'select',
                  values: ['iPhone 14', 'iPhone 13', 'iPhone SE', 'iPhone 12'],
                  isInherited: false
                }
              ]
            },
            children: []
          },
          {
            id: 'cat-4',
            name: 'Samsung Galaxy',
            slug: 'samsung-galaxy',
            description: 'Samsung Galaxy smartphones and accessories',
            parentId: 'cat-2',
            level: 2,
            position: 2,
            isActive: true,
            isDefault: false,
            isFeatured: false,
            path: 'electronics/smartphones/samsung-galaxy',
            images: {
              icon: '/assets/categories/icons/samsung.svg',
              thumbnail: '/assets/categories/thumbnails/galaxy.jpg',
              banner: '/assets/categories/banners/galaxy.jpg'
            },
            metadata: {
              seo: {
                metaTitle: 'Samsung Galaxy Phones - S Series, A Series & More',
                metaDescription: 'Explore Samsung Galaxy phones including the S Series, A Series, and foldable devices. Find cases and accessories for all models.',
                keywords: 'samsung, galaxy, s23, fold, flip, samsung accessories'
              },
              visibility: {
                webstore: true,
                b2bPortal: true,
                pos: true
              },
              analytics: {
                revenue: 58046.24,
                unitsSold: 783,
                viewCount: 4433,
                conversion: 5.8
              },
              attributes: [
                {
                  id: 'attr-6',
                  name: 'Model',
                  code: 'galaxy_model',
                  type: 'select',
                  values: ['S Series', 'A Series', 'Fold', 'Flip'],
                  isInherited: false
                }
              ]
            },
            children: []
          }
        ]
      },
      {
        id: 'cat-5',
        name: 'Laptops',
        slug: 'laptops',
        description: 'Powerful laptops for work, gaming, and everyday use',
        parentId: 'cat-1',
        level: 1,
        position: 2,
        isActive: true,
        isDefault: false,
        isFeatured: true,
        path: 'electronics/laptops',
        images: {
          icon: '/assets/categories/icons/laptops.svg',
          thumbnail: '/assets/categories/thumbnails/laptops.jpg',
          banner: '/assets/categories/banners/laptops.jpg',
          heroImage: '/assets/categories/heroes/laptops.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Laptops for Work, Gaming & Everyday Use',
            metaDescription: 'Shop laptops from top brands like Apple, Dell, HP, and Lenovo. Find models for gaming, business, student use, and more.',
            keywords: 'laptops, macbook, gaming laptops, business laptops, lenovo, dell, hp'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true
          },
          accessControl: {
            roles: ['admin', 'manager', 'sales']
          },
          analytics: {
            revenue: 88900.33,
            unitsSold: 532,
            viewCount: 6824,
            conversion: 3.8
          },
          attributes: [
            {
              id: 'attr-7',
              name: 'Processor',
              code: 'processor',
              type: 'select',
              values: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2'],
              isInherited: false
            },
            {
              id: 'attr-8',
              name: 'RAM',
              code: 'ram',
              type: 'select',
              values: ['4GB', '8GB', '16GB', '32GB', '64GB'],
              isInherited: false
            },
            {
              id: 'attr-9',
              name: 'SSD',
              code: 'ssd',
              type: 'select',
              values: ['256GB', '512GB', '1TB', '2TB'],
              isInherited: false
            }
          ]
        },
        children: [
          {
            id: 'cat-6',
            name: 'Gaming Laptops',
            slug: 'gaming-laptops',
            description: 'High-performance laptops built for gaming',
            parentId: 'cat-5',
            level: 2,
            position: 1,
            isActive: true,
            isDefault: false,
            isFeatured: true,
            path: 'electronics/laptops/gaming-laptops',
            images: {
              icon: '/assets/categories/icons/gaming.svg',
              thumbnail: '/assets/categories/thumbnails/gaming-laptops.jpg',
              banner: '/assets/categories/banners/gaming-laptops.jpg'
            },
            metadata: {
              seo: {
                metaTitle: 'Gaming Laptops - High Performance Gaming Machines',
                metaDescription: 'Shop gaming laptops with powerful GPUs, high refresh rates, and RGB keyboards from brands like ASUS ROG, MSI, Alienware, and Razer.',
                keywords: 'gaming laptops, alienware, asus rog, msi, razer, rtx, gaming'
              },
              visibility: {
                webstore: true,
                b2bPortal: false,
                pos: true
              },
              analytics: {
                revenue: 42780.55,
                unitsSold: 156,
                viewCount: 3245,
                conversion: 3.2
              },
              attributes: [
                {
                  id: 'attr-10',
                  name: 'GPU',
                  code: 'gpu',
                  type: 'select',
                  values: ['NVIDIA RTX 3050', 'NVIDIA RTX 3060', 'NVIDIA RTX 3070', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'AMD Radeon RX 6600M', 'AMD Radeon RX 6700M'],
                  isInherited: false
                },
                {
                  id: 'attr-11',
                  name: 'Refresh Rate',
                  code: 'refresh_rate',
                  type: 'select',
                  values: ['60Hz', '120Hz', '144Hz', '165Hz', '240Hz', '360Hz'],
                  isInherited: false
                }
              ]
            },
            children: []
          },
          {
            id: 'cat-7',
            name: 'Business Laptops',
            slug: 'business-laptops',
            description: 'Reliable laptops for business and professional use',
            parentId: 'cat-5',
            level: 2,
            position: 2,
            isActive: true,
            isDefault: false,
            isFeatured: false,
            path: 'electronics/laptops/business-laptops',
            images: {
              icon: '/assets/categories/icons/business.svg',
              thumbnail: '/assets/categories/thumbnails/business-laptops.jpg',
              banner: '/assets/categories/banners/business-laptops.jpg'
            },
            metadata: {
              seo: {
                metaTitle: 'Business Laptops - Professional Computers for Work',
                metaDescription: 'Find reliable business laptops with enhanced security features, long battery life, and professional design from Dell, Lenovo, HP, and Apple.',
                keywords: 'business laptops, thinkpad, dell latitude, hp elitebook, macbook pro'
              },
              visibility: {
                webstore: true,
                b2bPortal: true,
                pos: true
              },
              analytics: {
                revenue: 46119.78,
                unitsSold: 376,
                viewCount: 3579,
                conversion: 4.1
              },
              attributes: [
                {
                  id: 'attr-12',
                  name: 'Security Features',
                  code: 'security_features',
                  type: 'multiselect',
                  values: ['Fingerprint Reader', 'Face Recognition', 'TPM', 'Privacy Screen', 'Smart Card Reader'],
                  isInherited: false
                },
                {
                  id: 'attr-13',
                  name: 'Battery Life',
                  code: 'battery_life',
                  type: 'select',
                  values: ['Up to 8 hours', '8-12 hours', '12-16 hours', '16+ hours'],
                  isInherited: false
                }
              ]
            },
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'cat-8',
    name: 'Apparel',
    slug: 'apparel',
    description: 'Clothing, shoes, and accessories for all ages',
    parentId: null,
    level: 0,
    position: 2,
    isActive: true,
    isDefault: false,
    isFeatured: true,
    path: 'apparel',
    images: {
      icon: '/assets/categories/icons/apparel.svg',
      thumbnail: '/assets/categories/thumbnails/apparel.jpg',
      banner: '/assets/categories/banners/apparel.jpg',
      heroImage: '/assets/categories/heroes/apparel.jpg'
    },
    metadata: {
      seo: {
        metaTitle: 'Shop Apparel - Clothing, Shoes & Accessories',
        metaDescription: 'Find the latest in fashion with our wide selection of clothing, shoes, and accessories for men, women, and children.',
        keywords: 'clothing, apparel, fashion, shoes, accessories, mens, womens'
      },
      visibility: {
        webstore: true,
        b2bPortal: true,
        pos: true,
        startDate: null,
        endDate: null
      },
      accessControl: {
        roles: ['admin', 'manager', 'sales']
      },
      analytics: {
        revenue: 189456.32,
        unitsSold: 5678,
        viewCount: 23456,
        conversion: 4.8
      },
      attributes: [
        {
          id: 'attr-14',
          name: 'Material',
          code: 'material',
          type: 'select',
          values: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather'],
          isInherited: true
        },
        {
          id: 'attr-15',
          name: 'Care Instructions',
          code: 'care_instructions',
          type: 'select',
          values: ['Machine Washable', 'Hand Wash Only', 'Dry Clean Only', 'Spot Clean'],
          isInherited: true
        }
      ]
    },
    children: [
      {
        id: 'cat-9',
        name: 'Men\'s Clothing',
        slug: 'mens-clothing',
        description: 'Clothing and accessories for men',
        parentId: 'cat-8',
        level: 1,
        position: 1,
        isActive: true,
        isDefault: false,
        isFeatured: false,
        path: 'apparel/mens-clothing',
        images: {
          icon: '/assets/categories/icons/mens.svg',
          thumbnail: '/assets/categories/thumbnails/mens.jpg',
          banner: '/assets/categories/banners/mens.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Men\'s Clothing - Shirts, Pants, Jackets & More',
            metaDescription: 'Shop men\'s clothing including shirts, pants, jackets, sweaters, and accessories. Find casual and formal wear for every occasion.',
            keywords: 'mens clothing, shirts, pants, jackets, menswear, formal wear, casual wear'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true
          },
          analytics: {
            revenue: 78945.67,
            unitsSold: 2345,
            viewCount: 10567,
            conversion: 5.2
          },
          attributes: [
            {
              id: 'attr-16',
              name: 'Size',
              code: 'mens_size',
              type: 'select',
              values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
              isInherited: false
            },
            {
              id: 'attr-17',
              name: 'Fit',
              code: 'fit',
              type: 'select',
              values: ['Slim', 'Regular', 'Relaxed', 'Athletic'],
              isInherited: false
            }
          ]
        },
        children: [
          {
            id: 'cat-10',
            name: 'Shirts',
            slug: 'mens-shirts',
            description: 'T-shirts, button-ups, and other tops for men',
            parentId: 'cat-9',
            level: 2,
            position: 1,
            isActive: true,
            isDefault: false,
            isFeatured: false,
            path: 'apparel/mens-clothing/mens-shirts',
            images: {
              icon: '/assets/categories/icons/shirts.svg',
              thumbnail: '/assets/categories/thumbnails/mens-shirts.jpg',
              banner: '/assets/categories/banners/mens-shirts.jpg'
            },
            metadata: {
              seo: {
                metaTitle: 'Men\'s Shirts - T-Shirts, Button-Ups & More',
                metaDescription: 'Shop men\'s shirts including t-shirts, button-up shirts, polos, and dress shirts for casual and formal occasions.',
                keywords: 'mens shirts, t-shirts, button up, dress shirts, polos'
              },
              visibility: {
                webstore: true,
                b2bPortal: true,
                pos: true
              },
              analytics: {
                revenue: 34567.89,
                unitsSold: 1234,
                viewCount: 5678,
                conversion: 5.4
              },
              attributes: [
                {
                  id: 'attr-18',
                  name: 'Sleeve Length',
                  code: 'sleeve_length',
                  type: 'select',
                  values: ['Short Sleeve', 'Long Sleeve', '3/4 Sleeve', 'Sleeveless'],
                  isInherited: false
                },
                {
                  id: 'attr-19',
                  name: 'Collar Type',
                  code: 'collar_type',
                  type: 'select',
                  values: ['Crew Neck', 'V-Neck', 'Button Down', 'Spread Collar', 'Mandarin'],
                  isInherited: false
                }
              ]
            },
            children: []
          }
        ]
      },
      {
        id: 'cat-11',
        name: 'Women\'s Clothing',
        slug: 'womens-clothing',
        description: 'Clothing and accessories for women',
        parentId: 'cat-8',
        level: 1,
        position: 2,
        isActive: true,
        isDefault: false,
        isFeatured: true,
        path: 'apparel/womens-clothing',
        images: {
          icon: '/assets/categories/icons/womens.svg',
          thumbnail: '/assets/categories/thumbnails/womens.jpg',
          banner: '/assets/categories/banners/womens.jpg',
          heroImage: '/assets/categories/heroes/womens.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Women\'s Clothing - Dresses, Tops, Bottoms & More',
            metaDescription: 'Shop women\'s clothing including dresses, tops, bottoms, jackets, and accessories. Find styles for every occasion and season.',
            keywords: 'womens clothing, dresses, tops, bottoms, womens fashion, casual wear, formal wear'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true
          },
          analytics: {
            revenue: 110510.65,
            unitsSold: 3333,
            viewCount: 12889,
            conversion: 6.1
          },
          attributes: [
            {
              id: 'attr-20',
              name: 'Size',
              code: 'womens_size',
              type: 'select',
              values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
              isInherited: false
            }
          ]
        },
        children: []
      }
    ]
  },
  {
    id: 'cat-12',
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Everything for your home, from furniture to kitchen appliances',
    parentId: null,
    level: 0,
    position: 3,
    isActive: true,
    isDefault: false,
    isFeatured: false,
    path: 'home-kitchen',
    images: {
      icon: '/assets/categories/icons/home.svg',
      thumbnail: '/assets/categories/thumbnails/home.jpg',
      banner: '/assets/categories/banners/home.jpg'
    },
    metadata: {
      seo: {
        metaTitle: 'Home & Kitchen - Furniture, Appliances & Decor',
        metaDescription: 'Shop everything for your home including furniture, kitchen appliances, home decor, and organization solutions.',
        keywords: 'home, kitchen, furniture, appliances, decor, housewares'
      },
      visibility: {
        webstore: true,
        b2bPortal: true,
        pos: true
      },
      accessControl: {
        roles: ['admin', 'manager', 'sales']
      },
      analytics: {
        revenue: 145678.90,
        unitsSold: 4567,
        viewCount: 18765,
        conversion: 3.9
      },
      attributes: [
        {
          id: 'attr-21',
          name: 'Room',
          code: 'room',
          type: 'select',
          values: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room', 'Outdoor'],
          isInherited: true
        }
      ]
    },
    children: [
      {
        id: 'cat-13',
        name: 'Furniture',
        slug: 'furniture',
        description: 'Tables, chairs, sofas, beds, and more',
        parentId: 'cat-12',
        level: 1,
        position: 1,
        isActive: true,
        isDefault: false,
        isFeatured: false,
        path: 'home-kitchen/furniture',
        images: {
          icon: '/assets/categories/icons/furniture.svg',
          thumbnail: '/assets/categories/thumbnails/furniture.jpg',
          banner: '/assets/categories/banners/furniture.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Furniture - Tables, Chairs, Sofas & More',
            metaDescription: 'Shop furniture for every room in your home, including sofas, tables, chairs, beds, and storage solutions.',
            keywords: 'furniture, tables, chairs, sofas, beds, dressers, shelves'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true
          },
          analytics: {
            revenue: 67890.12,
            unitsSold: 789,
            viewCount: 8765,
            conversion: 2.8
          },
          attributes: [
            {
              id: 'attr-22',
              name: 'Material',
              code: 'furniture_material',
              type: 'select',
              values: ['Wood', 'Metal', 'Glass', 'Plastic', 'Fabric', 'Leather', 'Composite'],
              isInherited: false
            },
            {
              id: 'attr-23',
              name: 'Assembly Required',
              code: 'assembly_required',
              type: 'boolean',
              values: ['Yes', 'No'],
              isInherited: false
            }
          ]
        },
        children: []
      },
      {
        id: 'cat-14',
        name: 'Kitchen Appliances',
        slug: 'kitchen-appliances',
        description: 'Appliances for cooking, food preparation, and more',
        parentId: 'cat-12',
        level: 1,
        position: 2,
        isActive: true,
        isDefault: false,
        isFeatured: false,
        path: 'home-kitchen/kitchen-appliances',
        images: {
          icon: '/assets/categories/icons/appliances.svg',
          thumbnail: '/assets/categories/thumbnails/kitchen-appliances.jpg',
          banner: '/assets/categories/banners/kitchen-appliances.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Kitchen Appliances - Cooking & Food Prep Essentials',
            metaDescription: 'Shop kitchen appliances including blenders, mixers, coffee makers, toasters, and more for all your cooking and food preparation needs.',
            keywords: 'kitchen appliances, blenders, mixers, coffee makers, toasters, food processors'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true
          },
          analytics: {
            revenue: 77788.99,
            unitsSold: 3778,
            viewCount: 10000,
            conversion: 5.0
          },
          attributes: [
            {
              id: 'attr-24',
              name: 'Power',
              code: 'appliance_power',
              type: 'select',
              values: ['Under 500W', '500-999W', '1000-1499W', '1500W+'],
              isInherited: false
            },
            {
              id: 'attr-25',
              name: 'Capacity',
              code: 'appliance_capacity',
              type: 'select',
              values: ['Small (1-2 people)', 'Medium (3-4 people)', 'Large (5+ people)'],
              isInherited: false
            }
          ]
        },
        children: []
      }
    ]
  },
  {
    id: 'cat-15',
    name: 'Seasonal',
    slug: 'seasonal',
    description: 'Seasonal products, holiday specials, and limited-time offerings',
    parentId: null,
    level: 0,
    position: 4,
    isActive: true,
    isDefault: false,
    isFeatured: true,
    path: 'seasonal',
    images: {
      icon: '/assets/categories/icons/seasonal.svg',
      thumbnail: '/assets/categories/thumbnails/seasonal.jpg',
      banner: '/assets/categories/banners/seasonal.jpg',
      heroImage: '/assets/categories/heroes/seasonal.jpg'
    },
    metadata: {
      seo: {
        metaTitle: 'Seasonal Items - Holiday Specials & Limited Time Offers',
        metaDescription: 'Shop seasonal collections, holiday specials, and limited-time products for every time of year.',
        keywords: 'seasonal, holiday, christmas, halloween, summer, winter, special offers'
      },
      visibility: {
        webstore: true,
        b2bPortal: true,
        pos: true,
        startDate: '2025-05-01',
        endDate: '2025-12-31'
      },
      accessControl: {
        roles: ['admin', 'manager', 'sales', 'seasonal']
      },
      analytics: {
        revenue: 45678.90,
        unitsSold: 1234,
        viewCount: 7890,
        conversion: 4.7
      },
      attributes: []
    },
    children: [
      {
        id: 'cat-16',
        name: 'Summer Collection',
        slug: 'summer-collection',
        description: 'Products for summer activities and warm weather',
        parentId: 'cat-15',
        level: 1,
        position: 1,
        isActive: true,
        isDefault: false,
        isFeatured: true,
        path: 'seasonal/summer-collection',
        images: {
          icon: '/assets/categories/icons/summer.svg',
          thumbnail: '/assets/categories/thumbnails/summer.jpg',
          banner: '/assets/categories/banners/summer.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Summer Collection - Seasonal Products for Warm Weather',
            metaDescription: 'Shop our summer collection featuring swimwear, outdoor furniture, barbecue accessories, and more for the warm season.',
            keywords: 'summer, swimwear, outdoor, barbecue, beach, vacation'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true,
            startDate: '2025-05-01',
            endDate: '2025-08-31'
          },
          analytics: {
            revenue: 23456.78,
            unitsSold: 567,
            viewCount: 4321,
            conversion: 5.2
          },
          attributes: []
        },
        children: []
      },
      {
        id: 'cat-17',
        name: 'Holiday Specials',
        slug: 'holiday-specials',
        description: 'Special products and gift ideas for the holiday season',
        parentId: 'cat-15',
        level: 1,
        position: 2,
        isActive: true,
        isDefault: false,
        isFeatured: true,
        path: 'seasonal/holiday-specials',
        images: {
          icon: '/assets/categories/icons/holiday.svg',
          thumbnail: '/assets/categories/thumbnails/holiday.jpg',
          banner: '/assets/categories/banners/holiday.jpg'
        },
        metadata: {
          seo: {
            metaTitle: 'Holiday Specials - Christmas, Hanukkah & Winter Gifts',
            metaDescription: 'Find the perfect holiday gifts, decorations, and special items for Christmas, Hanukkah, and winter celebrations.',
            keywords: 'holiday, christmas, hanukkah, gifts, decorations, winter, santa'
          },
          visibility: {
            webstore: true,
            b2bPortal: true,
            pos: true,
            startDate: '2025-11-01',
            endDate: '2025-12-31'
          },
          analytics: {
            revenue: 22222.12,
            unitsSold: 667,
            viewCount: 3569,
            conversion: 6.7
          },
          attributes: []
        },
        children: []
      }
    ]
  },
  {
    id: 'cat-18',
    name: 'Internal',
    slug: 'internal',
    description: 'Internal categories for organization - not visible to customers',
    parentId: null,
    level: 0,
    position: 5,
    isActive: true,
    isDefault: false,
    isFeatured: false,
    path: 'internal',
    images: {
      icon: '/assets/categories/icons/internal.svg',
      thumbnail: '/assets/categories/thumbnails/internal.jpg'
    },
    metadata: {
      seo: {
        metaTitle: 'Internal Categories',
        metaDescription: 'Internal use only.'
      },
      visibility: {
        webstore: false,
        b2bPortal: false,
        pos: true
      },
      accessControl: {
        roles: ['admin', 'manager']
      },
      analytics: {
        revenue: 0,
        unitsSold: 0,
        viewCount: 246,
        conversion: 0
      },
      attributes: []
    },
    children: [
      {
        id: 'cat-19',
        name: 'Discontinued',
        slug: 'discontinued',
        description: 'Products that have been discontinued',
        parentId: 'cat-18',
        level: 1,
        position: 1,
        isActive: true,
        isDefault: false,
        isFeatured: false,
        path: 'internal/discontinued',
        images: {
          icon: '/assets/categories/icons/discontinued.svg'
        },
        metadata: {
          visibility: {
            webstore: false,
            b2bPortal: false,
            pos: true
          },
          accessControl: {
            roles: ['admin', 'manager']
          },
          attributes: []
        },
        children: []
      },
      {
        id: 'cat-20',
        name: 'Coming Soon',
        slug: 'coming-soon',
        description: 'Products that will be available in the future',
        parentId: 'cat-18',
        level: 1,
        position: 2,
        isActive: true,
        isDefault: false,
        isFeatured: false,
        path: 'internal/coming-soon',
        images: {
          icon: '/assets/categories/icons/coming-soon.svg'
        },
        metadata: {
          visibility: {
            webstore: false,
            b2bPortal: false,
            pos: true
          },
          accessControl: {
            roles: ['admin', 'manager']
          },
          attributes: []
        },
        children: []
      }
    ]
  }
];

// Helper functions for working with the category tree
export const categoryUtils = {
  // Get flattened array of all categories
  flattenCategories(categories = categoriesData) {
    let result = [];
    
    const flatten = (items) => {
      items.forEach(item => {
        // Create a copy without the children array to avoid circular references
        const category = { ...item };
        delete category.children;
        
        result.push(category);
        
        if (item.children && item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    
    flatten(categories);
    return result;
  },
  
  // Find a category by ID
  findCategoryById(id, categories = categoriesData) {
    // Use the flattened array for easier searching
    return this.flattenCategories(categories).find(cat => cat.id === id);
  },
  
  // Find a category by slug
  findCategoryBySlug(slug, categories = categoriesData) {
    return this.flattenCategories(categories).find(cat => cat.slug === slug);
  },
  
  // Get all subcategories of a category (immediate children only)
  getSubcategories(parentId, categories = categoriesData) {
    const parent = this.findCategoryById(parentId, categories);
    if (!parent) return [];
    
    // Search through the original tree structure
    const findChildren = (items) => {
      for (const item of items) {
        if (item.id === parentId) {
          return item.children || [];
        }
        
        if (item.children && item.children.length > 0) {
          const result = findChildren(item.children);
          if (result.length > 0) return result;
        }
      }
      return [];
    };
    
    return findChildren(categories);
  },
  
  // Get all descendants of a category (all levels)
  getAllDescendants(parentId, categories = categoriesData) {
    let result = [];
    
    const collectDescendants = (id) => {
      const children = this.getSubcategories(id, categories);
      result = [...result, ...children];
      
      children.forEach(child => {
        collectDescendants(child.id);
      });
    };
    
    collectDescendants(parentId);
    return result;
  },
  
  // Get category path (breadcrumbs)
  getCategoryPath(categoryId, categories = categoriesData) {
    const result = [];
    const flatCategories = this.flattenCategories(categories);
    
    let current = flatCategories.find(c => c.id === categoryId);
    
    while (current) {
      result.unshift(current);
      if (!current.parentId) break;
      current = flatCategories.find(c => c.id === current.parentId);
    }
    
    return result;
  },
  
  // Get root categories
  getRootCategories(categories = categoriesData) {
    return categories.filter(category => !category.parentId);
  },
  
  // Get active categories
  getActiveCategories(categories = categoriesData) {
    return this.flattenCategories(categories).filter(cat => cat.isActive);
  },
  
  // Get featured categories
  getFeaturedCategories(categories = categoriesData) {
    return this.flattenCategories(categories).filter(cat => cat.isFeatured);
  },
  
  // Get categories by visibility channel
  getCategoriesByChannel(channel, categories = categoriesData) {
    return this.flattenCategories(categories).filter(cat => {
      if (!cat.metadata?.visibility) return false;
      return cat.metadata.visibility[channel] === true;
    });
  },
  
  // Get categories accessible by role
  getCategoriesByRole(role, categories = categoriesData) {
    return this.flattenCategories(categories).filter(cat => {
      if (!cat.metadata?.accessControl?.roles) return true; // Default to accessible
      return cat.metadata.accessControl.roles.includes(role);
    });
  },
  
  // Get categories with specific attribute
  getCategoriesWithAttribute(attributeCode, categories = categoriesData) {
    return this.flattenCategories(categories).filter(cat => {
      if (!cat.metadata?.attributes) return false;
      return cat.metadata.attributes.some(attr => attr.code === attributeCode);
    });
  },
  
  // Check if a category is active now (considering date range)
  isCategoryActiveNow(category) {
    if (!category.isActive) return false;
    
    const now = new Date();
    const startDate = category.metadata?.visibility?.startDate 
      ? new Date(category.metadata.visibility.startDate) 
      : null;
    const endDate = category.metadata?.visibility?.endDate 
      ? new Date(category.metadata.visibility.endDate) 
      : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  }
};

// Export sample categories data
export default categoriesData;