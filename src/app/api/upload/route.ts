import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Verify the requesting user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Validate file type
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const allowedTypes = [...imageTypes, ...videoTypes]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP, GIF, MP4 ou WebM.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB for images, 50MB for videos)
    const isVideo = videoTypes.includes(file.type)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo ${isVideo ? '50MB' : '5MB'}.` },
        { status: 400 }
      )
    }

    // Use admin client for storage operations
    const adminClient = createAdminClient()

    // Check if bucket exists, create if not
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'images')

    if (!bucketExists) {
      const { error: createError } = await adminClient.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      })

      if (createError) {
        console.error('Error creating bucket:', createError)
        return NextResponse.json(
          { error: 'Erro ao configurar storage. Verifique as permissões do Supabase.' },
          { status: 500 }
        )
      }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage using admin client
    const { data, error } = await adminClient.storage
      .from('images')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: `Erro ao fazer upload: ${error.message}` },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 })
  }
}
