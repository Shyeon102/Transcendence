import type { Media } from '../types/media'

interface MediaCardProps {
	media: Media
	onSelect: (media: Media) => void
}

const MediaCard = ({ media, onSelect }: MediaCardProps ) => {
	return (
		<div onClick={() => onSelect(media)} className="relative w-[237px] h-[416px] cursor-pointer overflow-hidden">
			<img
				src="/vhs-front.png"
				className="absolute inset-0 w-full h-full object-cover"
			/>
			<img
				src={media.posterUrl}
				alt={media.title}
				className="absolute inset-0 w-full h-full object-cover"
			/>
			<img
				src="/vhs-cover.png"
				className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-35"
			/>
		</div>
	)
}

export default MediaCard