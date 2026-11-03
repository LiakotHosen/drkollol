import {
  DEFAULT_SITE_SETTINGS,
  DEFAULT_HERO_SECTION,
  DEFAULT_SURGEON_PROFILE,
  DEFAULT_CATEGORIES,
  DEFAULT_CONDITIONS,
  DEFAULT_SERIAL_STEPS,
  DEFAULT_CHAMBERS,
  DEFAULT_REVIEWS,
  DEFAULT_FAQS,
  DEFAULT_BLOGS,
  DEFAULT_GALLERY_PHOTOS,
  DEFAULT_GALLERY_VIDEOS,
  DEFAULT_CHATBOT_CONFIG,
} from './default-data';
import {
  SiteSettings,
  HeroSection,
  SurgeonProfile,
  Category,
  Condition,
  SerialStep,
  Chamber,
  Review,
  FAQ,
  BlogPost,
  Appointment,
  GalleryPhoto,
  GalleryVideo,
  ChatbotConfig,
} from '@/types/database';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { galleryVideoSchema } from '@/lib/validations/gallery-video';

// In-memory runtime store for development & mock fallback
let memSiteSettings: SiteSettings = { ...DEFAULT_SITE_SETTINGS };
let memHeroSection: HeroSection = { ...DEFAULT_HERO_SECTION };
let memSurgeonProfile: SurgeonProfile = { ...DEFAULT_SURGEON_PROFILE };
let memCategories: Category[] = [...DEFAULT_CATEGORIES];
let memConditions: Condition[] = [...DEFAULT_CONDITIONS];
let memSerialSteps: SerialStep[] = [...DEFAULT_SERIAL_STEPS];
let memChambers: Chamber[] = [...DEFAULT_CHAMBERS];
let memReviews: Review[] = [...DEFAULT_REVIEWS];
let memFaqs: FAQ[] = [...DEFAULT_FAQS];
let memBlogs: BlogPost[] = [...DEFAULT_BLOGS];
let memAppointments: Appointment[] = [];
let memGalleryPhotos: GalleryPhoto[] = [...DEFAULT_GALLERY_PHOTOS];
let memGalleryVideos: GalleryVideo[] = [];
let memChatbotConfig: ChatbotConfig = { ...DEFAULT_CHATBOT_CONFIG };


export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (!error && data) {
        memSiteSettings = data as SiteSettings;
        return memSiteSettings;
      }
    } catch (e) {
      console.warn('Falling back to cached site settings:', e);
    }
  }
  return memSiteSettings;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  memSiteSettings = { ...memSiteSettings, ...settings, updated_at: new Date().toISOString() };
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('site_settings').upsert(memSiteSettings);
      if (error) console.error('Supabase updateSiteSettings error:', error);
    } catch (e) {
      console.error('Supabase updateSiteSettings exception:', e);
    }
  }
  return memSiteSettings;
}

export async function getHeroSection(): Promise<HeroSection> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('hero_section').select('*').limit(1).single();
      if (!error && data) {
        memHeroSection = data as HeroSection;
        return memHeroSection;
      }
    } catch (e) {
      console.warn('Falling back to cached hero section:', e);
    }
  }
  return memHeroSection;
}

export async function updateHeroSection(hero: Partial<HeroSection>): Promise<HeroSection> {
  memHeroSection = { ...memHeroSection, ...hero, updated_at: new Date().toISOString() };
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('hero_section').upsert(memHeroSection);
      if (error) console.error('Supabase updateHeroSection error:', error);
    } catch (e) {
      console.error('Supabase updateHeroSection exception:', e);
    }
  }
  return memHeroSection;
}

export async function getSurgeonProfile(): Promise<SurgeonProfile> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('surgeon_profile').select('*').limit(1).single();
      if (!error && data) {
        memSurgeonProfile = data as SurgeonProfile;
        return memSurgeonProfile;
      }
    } catch (e) {
      console.warn('Falling back to cached surgeon profile:', e);
    }
  }
  return memSurgeonProfile;
}

export async function updateSurgeonProfile(profile: Partial<SurgeonProfile>): Promise<SurgeonProfile> {
  memSurgeonProfile = { ...memSurgeonProfile, ...profile, updated_at: new Date().toISOString() };
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('surgeon_profile').upsert(memSurgeonProfile);
      if (error) console.error('Supabase updateSurgeonProfile error:', error);
    } catch (e) {
      console.error('Supabase updateSurgeonProfile exception:', e);
    }
  }
  return memSurgeonProfile;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        memCategories = data as Category[];
        return memCategories;
      }
    } catch (e) {
      console.warn('Falling back to cached categories:', e);
    }
  }
  return memCategories;
}

export async function getConditions(categorySlug?: string): Promise<Condition[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      let query = supabase.from('conditions').select('*').eq('is_hidden', false).order('sort_order', { ascending: true });
      if (categorySlug) {
        query = query.eq('category_slug', categorySlug);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Condition[];
      }
    } catch (e) {
      console.warn('Falling back to cached conditions:', e);
    }
  }
  let list = memConditions.filter((c) => !c.is_hidden);
  if (categorySlug) {
    list = list.filter((c) => c.category_slug === categorySlug);
  }
  return list;
}

export async function getAllConditionsAdmin(): Promise<Condition[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('conditions').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        memConditions = data as Condition[];
        return memConditions;
      }
    } catch (e) {
      console.warn('Falling back to all mem conditions:', e);
    }
  }
  return memConditions;
}

export async function getConditionBySlug(slug: string): Promise<Condition | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('conditions').select('*').eq('slug', slug).single();
      if (!error && data) return data as Condition;
    } catch (e) {
      console.warn('Falling back to cached condition by slug:', e);
    }
  }
  return memConditions.find((c) => c.slug === slug) || null;
}

export async function saveCondition(condition: Condition): Promise<Condition> {
  const idx = memConditions.findIndex((c) => c.slug === condition.slug);
  if (idx >= 0) {
    memConditions[idx] = { ...memConditions[idx], ...condition };
  } else {
    memConditions.push(condition);
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('conditions').upsert(condition);
      if (error) console.error('Supabase saveCondition error:', error);
    } catch (e) {
      console.error('Supabase saveCondition exception:', e);
    }
  }
  return condition;
}

export async function deleteCondition(slug: string): Promise<boolean> {
  memConditions = memConditions.filter((c) => c.slug !== slug);
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('conditions').delete().eq('slug', slug);
      if (error) console.error('Supabase deleteCondition error:', error);
    } catch (e) {
      console.error('Supabase deleteCondition exception:', e);
    }
  }
  return true;
}

export async function getSerialSteps(): Promise<SerialStep[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('serial_steps').select('*').order('step_number', { ascending: true });
      if (!error && data && data.length > 0) {
        memSerialSteps = data as SerialStep[];
        return memSerialSteps;
      }
    } catch (e) {
      console.warn('Falling back to cached serial steps:', e);
    }
  }
  return memSerialSteps;
}

export async function updateSerialStep(step: SerialStep): Promise<SerialStep> {
  const idx = memSerialSteps.findIndex((s) => s.step_number === step.step_number);
  if (idx >= 0) {
    memSerialSteps[idx] = { ...memSerialSteps[idx], ...step };
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('serial_steps').upsert(step);
      if (error) console.error('Supabase updateSerialStep error:', error);
    } catch (e) {
      console.error('Supabase updateSerialStep exception:', e);
    }
  }
  return step;
}

export async function getChambers(): Promise<Chamber[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('chambers').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        memChambers = data as Chamber[];
        return memChambers;
      }
    } catch (e) {
      console.warn('Falling back to cached chambers:', e);
    }
  }
  return memChambers;
}

export async function saveChamber(chamber: Chamber): Promise<Chamber> {
  const idx = memChambers.findIndex((c) => c.id === chamber.id);
  if (idx >= 0) {
    memChambers[idx] = { ...memChambers[idx], ...chamber };
  } else {
    memChambers.push(chamber);
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('chambers').upsert(chamber);
      if (error) console.error('Supabase saveChamber error:', error);
    } catch (e) {
      console.error('Supabase saveChamber exception:', e);
    }
  }
  return chamber;
}

export async function deleteChamber(id: number): Promise<boolean> {
  memChambers = memChambers.filter((c) => c.id !== id);
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('chambers').delete().eq('id', id);
      if (error) console.error('Supabase deleteChamber error:', error);
    } catch (e) {
      console.error('Supabase deleteChamber exception:', e);
    }
  }
  return true;
}

export async function getReviews(): Promise<Review[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('reviews').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        memReviews = data as Review[];
        return memReviews;
      }
    } catch (e) {
      console.warn('Falling back to cached reviews:', e);
    }
  }
  return memReviews;
}

export async function saveReview(review: Review): Promise<Review> {
  const idx = memReviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    memReviews[idx] = { ...memReviews[idx], ...review };
  } else {
    memReviews.push(review);
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('reviews').upsert(review);
      if (error) console.error('Supabase saveReview error:', error);
    } catch (e) {
      console.error('Supabase saveReview exception:', e);
    }
  }
  return review;
}

export async function deleteReview(id: number): Promise<boolean> {
  memReviews = memReviews.filter((r) => r.id !== id);
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) console.error('Supabase deleteReview error:', error);
    } catch (e) {
      console.error('Supabase deleteReview exception:', e);
    }
  }
  return true;
}

export async function getFaqs(): Promise<FAQ[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        memFaqs = data as FAQ[];
        return memFaqs;
      }
    } catch (e) {
      console.warn('Falling back to cached faqs:', e);
    }
  }
  return memFaqs;
}

export async function saveFaq(faq: FAQ): Promise<FAQ> {
  const idx = memFaqs.findIndex((f) => f.id === faq.id);
  if (idx >= 0) {
    memFaqs[idx] = { ...memFaqs[idx], ...faq };
  } else {
    memFaqs.push(faq);
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').upsert(faq);
      if (error) console.error('Supabase saveFaq error:', error);
    } catch (e) {
      console.error('Supabase saveFaq exception:', e);
    }
  }
  return faq;
}

export async function deleteFaq(id: number): Promise<boolean> {
  memFaqs = memFaqs.filter((f) => f.id !== id);
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) console.error('Supabase deleteFaq error:', error);
    } catch (e) {
      console.error('Supabase deleteFaq exception:', e);
    }
  }
  return true;
}

export async function getBlogs(): Promise<BlogPost[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as BlogPost[];
      }
    } catch (e) {
      console.warn('Falling back to cached published blogs:', e);
    }
  }
  return memBlogs.filter((b) => b.is_published);
}

export async function getAllBlogsAdmin(): Promise<BlogPost[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('blogs').select('*').order('published_at', { ascending: false });
      if (!error && data && data.length > 0) {
        memBlogs = data as BlogPost[];
        return memBlogs;
      }
    } catch (e) {
      console.warn('Falling back to all cached blogs:', e);
    }
  }
  return memBlogs;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
      if (!error && data) return data as BlogPost;
    } catch (e) {
      console.warn('Falling back to cached blog by slug:', e);
    }
  }
  return memBlogs.find((b) => b.slug === slug) || null;
}

export async function saveBlog(blog: BlogPost): Promise<BlogPost> {
  const sanitizedBlog: BlogPost = {
    ...blog,
    content_en: sanitizeHtml(blog.content_en || ''),
    content_bn: sanitizeHtml(blog.content_bn || ''),
    cover_image: (blog.cover_image || '').trim(),
  };

  const idx = memBlogs.findIndex((b) => b.slug === sanitizedBlog.slug);
  if (idx >= 0) {
    memBlogs[idx] = { ...memBlogs[idx], ...sanitizedBlog };
  } else {
    memBlogs.push(sanitizedBlog);
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').upsert(sanitizedBlog);
      if (error) console.error('Supabase saveBlog error:', error);
    } catch (e) {
      console.error('Supabase saveBlog exception:', e);
    }
  }
  return sanitizedBlog;
}

export async function deleteBlog(slug: string): Promise<boolean> {
  memBlogs = memBlogs.filter((b) => b.slug !== slug);
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('blogs').delete().eq('slug', slug);
      if (error) console.error('Supabase deleteBlog error:', error);
    } catch (e) {
      console.error('Supabase deleteBlog exception:', e);
    }
  }
  return true;
}

export async function getAppointments(): Promise<Appointment[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('appointments').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Appointment[];
    } catch (e) {
      console.warn('Falling back to mem appointments:', e);
    }
  }
  return memAppointments;
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
  const newAppointment: Appointment = {
    ...appointment,
    id: 'apt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
    status: appointment.status || 'pending',
  };
  memAppointments.unshift(newAppointment);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('appointments').insert(newAppointment);
      if (error) console.error('Supabase createAppointment error:', error);
    } catch (e) {
      console.error('Supabase createAppointment exception:', e);
    }
  }
  return newAppointment;
}

export async function updateAppointmentStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<boolean> {
  const apt = memAppointments.find((a) => a.id === id);
  if (apt) {
    apt.status = status;
  }
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) console.error('Supabase updateAppointmentStatus error:', error);
    } catch (e) {
      console.error('Supabase updateAppointmentStatus exception:', e);
    }
  }
  return true;
}

// ----------------------------------------------------------------------------------
// GALLERY PHOTOS SERVICE
// ----------------------------------------------------------------------------------

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (!error && data) {
        if (data.length > 0) {
          memGalleryPhotos = data as GalleryPhoto[];
          return memGalleryPhotos;
        } else {
          // Auto-seed initial default gallery photos if table is empty
          const { error: seedErr } = await supabase.from('gallery_photos').upsert(DEFAULT_GALLERY_PHOTOS);
          if (!seedErr) {
            memGalleryPhotos = [...DEFAULT_GALLERY_PHOTOS];
            return memGalleryPhotos;
          }
        }
      }
    } catch (e) {
      console.warn('Falling back to mem gallery photos:', e);
    }
  }
  return [...memGalleryPhotos].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
}

export async function saveGalleryPhoto(photo: GalleryPhoto): Promise<GalleryPhoto> {
  const photoToSave: GalleryPhoto = {
    ...photo,
    id: photo.id || 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    created_at: photo.created_at || new Date().toISOString(),
  };

  const existingIdx = memGalleryPhotos.findIndex((p) => p.id === photoToSave.id);
  if (existingIdx >= 0) {
    memGalleryPhotos[existingIdx] = photoToSave;
  } else {
    memGalleryPhotos.push(photoToSave);
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery_photos').upsert(photoToSave);
      if (error) {
        console.error('Supabase saveGalleryPhoto error:', error);
        throw error;
      }
    } catch (e) {
      console.error('Supabase saveGalleryPhoto exception:', e);
      throw e;
    }
  }

  return photoToSave;
}

export async function saveGalleryPhotosBulk(photosList: GalleryPhoto[]): Promise<GalleryPhoto[]> {
  const prepared: GalleryPhoto[] = photosList.map((photo, idx) => ({
    ...photo,
    id: photo.id || 'photo_' + (Date.now() + idx) + '_' + Math.random().toString(36).substring(2, 7),
    created_at: photo.created_at || new Date().toISOString(),
  }));

  for (const item of prepared) {
    const existingIdx = memGalleryPhotos.findIndex((p) => p.id === item.id);
    if (existingIdx >= 0) {
      memGalleryPhotos[existingIdx] = item;
    } else {
      memGalleryPhotos.push(item);
    }
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery_photos').upsert(prepared);
      if (error) {
        console.error('Supabase saveGalleryPhotosBulk error:', error);
        throw error;
      }
    } catch (e) {
      console.error('Supabase saveGalleryPhotosBulk exception:', e);
      throw e;
    }
  }

  return prepared;
}

export async function deleteGalleryPhoto(id: string): Promise<boolean> {
  memGalleryPhotos = memGalleryPhotos.filter((p) => p.id !== id);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteGalleryPhoto error:', error);
        throw error;
      }
    } catch (e) {
      console.error('Supabase deleteGalleryPhoto exception:', e);
      throw e;
    }
  }
  return true;
}

// ----------------------------------------------------------------------------------
// GALLERY VIDEOS SERVICE
// ----------------------------------------------------------------------------------

export async function getGalleryVideos(): Promise<GalleryVideo[]> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_videos')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (!error && data) {
        memGalleryVideos = data as GalleryVideo[];
        return memGalleryVideos;
      }
    } catch (e) {
      console.warn('Falling back to mem gallery videos:', e);
    }
  }
  return [...memGalleryVideos].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
}

export async function saveGalleryVideo(video: GalleryVideo): Promise<GalleryVideo> {
  const parsed = galleryVideoSchema.safeParse(video);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(', ');
    throw new Error('Validation failed: ' + errorMsg);
  }

  const validatedData = parsed.data;
  const videoToSave: GalleryVideo = {
    ...validatedData,
    created_at: validatedData.created_at || new Date().toISOString(),
  };

  const existingIdx = memGalleryVideos.findIndex((v) => v.id === videoToSave.id);
  if (existingIdx >= 0) {
    memGalleryVideos[existingIdx] = videoToSave;
  } else {
    memGalleryVideos.push(videoToSave);
  }

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery_videos').upsert(videoToSave);
      if (error) {
        console.error('Supabase saveGalleryVideo error:', error);
        throw error;
      }
    } catch (e) {
      console.error('Supabase saveGalleryVideo exception:', e);
      throw e;
    }
  }

  return videoToSave;
}

export async function deleteGalleryVideo(id: string): Promise<boolean> {
  if (!id || typeof id !== 'string') {
    throw new Error('Valid video ID is required for deletion.');
  }
  const cleanId = id.trim();
  memGalleryVideos = memGalleryVideos.filter((v) => v.id !== cleanId);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('gallery_videos').delete().eq('id', cleanId);
      if (error) {
        console.error('Supabase deleteGalleryVideo error:', error);
        throw error;
      }
    } catch (e) {
      console.error('Supabase deleteGalleryVideo exception:', e);
      throw e;
    }
  }
  return true;
}

// ----------------------------------------------------------------------------------
// CHATBOT SERVICE & KNOWLEDGE GROUNDING
// ----------------------------------------------------------------------------------

export async function getChatbotConfig(): Promise<ChatbotConfig> {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('chatbot_config')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        memChatbotConfig = {
          ...DEFAULT_CHATBOT_CONFIG,
          ...data,
          id: 'default',
          is_enabled: data.is_active ?? true,
          is_active: data.is_active ?? true,
          gemini_model: data.gemini_model || 'gemini-2.5-flash',
          gemini_api_keys: Array.isArray(data.gemini_api_keys) ? data.gemini_api_keys : [],
        };
      }
    } catch (e) {
      console.warn('Supabase getChatbotConfig notice:', e);
    }
  }

  // Also harvest API keys from environment variable if configured
  const envKeys = [
    process.env.GEMINI_API_KEY,
    ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : []),
  ]
    .map((k) => k?.trim())
    .filter(Boolean) as string[];

  // Database keys take precedence, combined with env keys
  const combinedKeys = Array.from(
    new Set([...(memChatbotConfig.gemini_api_keys || []), ...envKeys])
  );

  return {
    ...memChatbotConfig,
    gemini_api_keys: combinedKeys,
  };
}

export async function updateChatbotConfig(
  config: Partial<ChatbotConfig>
): Promise<ChatbotConfig> {
  const isEnabled =
    config.is_enabled !== undefined
      ? config.is_enabled
      : config.is_active !== undefined
      ? config.is_active
      : (memChatbotConfig.is_enabled ?? true);

  const updatedKeys =
    config.gemini_api_keys !== undefined
      ? config.gemini_api_keys
      : (memChatbotConfig.gemini_api_keys || []);

  const updatedModel =
    config.gemini_model || memChatbotConfig.gemini_model || 'gemini-2.5-flash';

  memChatbotConfig = {
    ...memChatbotConfig,
    ...config,
    id: 'default',
    is_enabled: isEnabled,
    is_active: isEnabled,
    gemini_api_keys: updatedKeys,
    gemini_model: updatedModel,
    updated_at: new Date().toISOString(),
  };

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    try {
      const dbPayload = {
        id: 'default',
        is_active: isEnabled,
        gemini_api_keys: updatedKeys,
        gemini_model: updatedModel,
        welcome_message_en:
          memChatbotConfig.welcome_message_en || DEFAULT_CHATBOT_CONFIG.welcome_message_en,
        welcome_message_bn:
          memChatbotConfig.welcome_message_bn || DEFAULT_CHATBOT_CONFIG.welcome_message_bn,
        doctor_context_extra: memChatbotConfig.doctor_context_extra || '',
        max_tokens_per_response:
          memChatbotConfig.max_tokens_per_reply ??
          memChatbotConfig.max_tokens_per_response ??
          600,
        temperature: memChatbotConfig.temperature ?? 0.3,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('chatbot_config')
        .upsert(dbPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateChatbotConfig error:', error.message);
        throw error;
      }

      if (data) {
        memChatbotConfig = {
          ...memChatbotConfig,
          ...data,
          id: 'default',
          is_enabled: data.is_active ?? true,
          is_active: data.is_active ?? true,
          gemini_api_keys: Array.isArray(data.gemini_api_keys) ? data.gemini_api_keys : [],
          gemini_model: data.gemini_model || 'gemini-2.5-flash',
        };
      }
    } catch (e) {
      console.error('Supabase updateChatbotConfig exception:', e);
      throw e;
    }
  }

  return memChatbotConfig;
}

/**
 * Compiles real-time verified clinical knowledge from the website database
 * Injected into Gemini system instructions for 100% accurate, hallucination-free answers.
 */
export async function getDoctorKnowledgeContext(): Promise<string> {
  const [settings, profile, chambers, conditions, faqs] = await Promise.all([
    getSiteSettings(),
    getSurgeonProfile(),
    getChambers(),
    getAllConditionsAdmin(),
    getFaqs(),
  ]);

  const chambersText = chambers
    .map(
      (c, idx) =>
        `${idx + 1}. **${c.name_en} (${c.name_bn})**\n   - লোকেশন/ঠিকানা: ${c.address_bn} (${c.address_en})\n   - রোগী দেখার সময়সূচী: ${c.schedule_bn} | ${c.timing_bn} (${c.schedule_en} | ${c.timing_en})`
    )
    .join('\n\n');

  const conditionsText = conditions
    .slice(0, 15)
    .map(
      (cond) =>
        `- **${cond.name_bn} (${cond.name_en})**: ${cond.short_bn}. সাধারণ উপসর্গ: ${cond.symptoms_bn?.join(', ') || ''}. আধুনিক চিকিৎসা: ${cond.treat_bn?.join(', ') || ''}`
    )
    .join('\n');

  const faqsText = faqs
    .map((f, idx) => `Q${idx + 1}: ${f.question_bn} (${f.question_en})\nA: ${f.answer_bn}`)
    .join('\n\n');

  return `
### সার্জন পরিচিতি (Surgeon Profile):
- নাম: ${profile.name_bn} (${profile.name_en})
- পদবী: ${profile.role_bn} (${profile.post_bn}) — ময়মনসিংহ মেডিকেল কলেজ ও হাসপাতাল (MMCH)
- ডিগ্রি ও প্রশিক্ষণ: MBBS, BCS (স্বাস্থ্য), FCPS (সার্জারি), MACS (USA), FMAS (ল্যাপারোস্কপিক সার্জারি)
- BMDC রেজি নং: ${settings.bmdc_reg}
- বিশেষ দক্ষতা: আধুনিক ল্যাপারোস্কপিক সার্জারি, পাইলস ও ফিস্টুলার ব্যথাহীন চিকিৎসা (লঙ্গো ও লেজার), ব্রেস্ট টিউমার ও ক্যান্সার স্ক্রিনিং, হার্নিয়া ও পিত্তথলির পাথর।

### চেম্বার ও রোগী দেখার স্থান (Chambers & Visiting Hours):
${chambersText}

### সিরিয়াল বুকিং ও সরাসরি যোগাযোগ (Appointments & Contact):
- ব্যক্তিগত সহকারী মিলন: 01671-869026 (শেরপুর চেম্বার ১: হেলথ কেয়ার হাসপাতাল / শেরপুর চেম্বার ২: আমজাদ ডায়াগনস্টিক)
- সিরিয়াল ও তথ্য হটলাইন: 01750-529252 (ময়মনসিংহ চেম্বার: নিউ মেডিকেয়ার প্যাথলজি ল্যাব)
- ডাক্তারকে সরাসরি WhatsApp (জরুরি প্রয়োজনে সরাসরি পরামর্শ): 01670-879100
- ইমেইল: ${settings.email}
- অনলাইন অ্যাপয়েন্টমেন্ট: ওয়েবসাইটের "সিরিয়াল নিন" বাটন থেকে সরাসরি বুকিং ফর্ম পূরণ করা যায়।

### প্রধান সার্জারি ও চিকিৎসা সেবা (Key Procedures):
${conditionsText}

### সাধারণ প্রশ্নোত্তর (Verified Clinical FAQs):
${faqsText}

### ডিসক্লেইমার ও জরুরি প্রটোকল:
${settings.disclaimer_bn}
`;
}


