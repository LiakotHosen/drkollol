import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken } from '@/lib/auth/session';
import {
  getSiteSettings,
  updateSiteSettings,
  getHeroSection,
  updateHeroSection,
  getSurgeonProfile,
  updateSurgeonProfile,
  getCategories,
  getAllConditionsAdmin,
  saveCondition,
  deleteCondition,
  getSerialSteps,
  updateSerialStep,
  getChambers,
  saveChamber,
  deleteChamber,
  getReviews,
  saveReview,
  deleteReview,
  getFaqs,
  saveFaq,
  deleteFaq,
  getAllBlogsAdmin,
  saveBlog,
  deleteBlog,
  getAppointments,
  updateAppointmentStatus,
  getGalleryPhotos,
  saveGalleryPhoto,
  saveGalleryPhotosBulk,
  deleteGalleryPhoto,
  getGalleryVideos,
  saveGalleryVideo,
  deleteGalleryVideo,
} from '@/lib/content/service';

export async function GET(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get('kollol_admin_session')?.value;
  const session = await verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }


  const [
    siteSettings,
    heroSection,
    surgeonProfile,
    categories,
    conditions,
    serialSteps,
    chambers,
    reviews,
    faqs,
    blogs,
    appointments,
    galleryPhotos,
    galleryVideos,
  ] = await Promise.all([
    getSiteSettings(),
    getHeroSection(),
    getSurgeonProfile(),
    getCategories(),
    getAllConditionsAdmin(),
    getSerialSteps(),
    getChambers(),
    getReviews(),
    getFaqs(),
    getAllBlogsAdmin(),
    getAppointments(),
    getGalleryPhotos(),
    getGalleryVideos(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      siteSettings,
      heroSection,
      surgeonProfile,
      categories,
      conditions,
      serialSteps,
      chambers,
      reviews,
      faqs,
      blogs,
      appointments,
      galleryPhotos,
      galleryVideos,
    },
  });
}

export async function PUT(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get('kollol_admin_session')?.value;
  const session = await verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { section, payload } = await req.json();

    switch (section) {
      case 'siteSettings':
        await updateSiteSettings(payload);
        break;
      case 'heroSection':
        await updateHeroSection(payload);
        break;
      case 'surgeonProfile':
        await updateSurgeonProfile(payload);
        break;
      case 'condition':
        await saveCondition(payload);
        break;
      case 'serialStep':
        await updateSerialStep(payload);
        break;
      case 'chamber':
        await saveChamber(payload);
        break;
      case 'review':
        await saveReview(payload);
        break;
      case 'faq':
        await saveFaq(payload);
        break;
      case 'blog':
        await saveBlog(payload);
        break;
      case 'galleryPhoto':
        await saveGalleryPhoto(payload);
        break;
      case 'galleryPhotosBulk':
        await saveGalleryPhotosBulk(payload);
        break;
      case 'galleryVideo':
        await saveGalleryVideo(payload);
        break;
      case 'appointmentStatus':
        await updateAppointmentStatus(payload.id, payload.status);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unknown section specified.' }, { status: 400 });
    }

    // Automatically revalidate root layout & all nested static pages for instantaneous reflection
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/gallery');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: `${section} updated and synchronized successfully.` });
  } catch (error) {
    console.error('Admin content update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update content.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  // Check admin session
  const token = req.cookies.get('kollol_admin_session')?.value;
  const session = await verifyAdminToken(token);
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { section, id, slug } = await req.json();

    switch (section) {
      case 'condition':
        if (slug) await deleteCondition(slug);
        break;
      case 'chamber':
        if (id) await deleteChamber(Number(id));
        break;
      case 'review':
        if (id) await deleteReview(Number(id));
        break;
      case 'faq':
        if (id) await deleteFaq(Number(id));
        break;
      case 'blog':
        if (slug) await deleteBlog(slug);
        break;
      case 'galleryPhoto':
        if (id) await deleteGalleryPhoto(String(id));
        break;
      case 'galleryVideo':
        if (id) await deleteGalleryVideo(String(id));
        break;
      default:
        return NextResponse.json({ success: false, message: 'Unknown section for delete.' }, { status: 400 });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/gallery');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: `${section} removed successfully.` });
  } catch (error) {
    console.error('Admin content delete error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete content.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

