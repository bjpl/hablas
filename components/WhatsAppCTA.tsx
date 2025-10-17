'use client'

interface WhatsAppCTAProps {
  title: string
  description: string
  members: string
  link: string
}

export default function WhatsAppCTA({ title, description, members, link }: WhatsAppCTAProps) {
  const handleClick = () => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <article className="card-resource" aria-labelledby={`whatsapp-group-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 id={`whatsapp-group-${title.replace(/\s+/g, '-').toLowerCase()}`} className="font-bold text-lg mb-1 text-gray-900">
            {title}
          </h3>
          <p className="text-sm text-gray-700 mb-2">{description}</p>
          <p className="text-xs text-gray-600" aria-label={`${members} activos en el grupo`}>{members}</p>
        </div>
        <svg className="w-8 h-8 text-whatsapp flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
          <title>WhatsApp</title>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.84.5 3.56 1.37 5.04L2 22l5.08-1.33A9.91 9.91 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.66 0-3.21-.51-4.5-1.38l-.32-.2-3.33.87.89-3.24-.21-.34A7.918 7.918 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      </div>
      
      <button
        onClick={handleClick}
        className="btn-whatsapp w-full"
        aria-label={`Unirse al grupo de WhatsApp: ${title}`}
      >
        <span>Unirme al Grupo</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" role="img">
          <title>Ir al grupo</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <footer className="mt-3 text-xs text-gray-600">
        <p aria-label="Reglas del grupo"><span aria-hidden="true">📋</span> <strong>Reglas:</strong> Respeto, solo inglés para trabajo, no spam</p>
      </footer>
    </article>
  )
}