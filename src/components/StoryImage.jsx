export default function StoryImage({ media = null, className = "" }) {
	const sizes = media?.media_details?.sizes;
	// Build srcSet from available sizes
	const srcSet = [
		sizes?.thumbnail && `${sizes.thumbnail.source_url} 150w`,
		sizes?.medium && `${sizes.medium.source_url} 300w`,
		sizes?.medium_large && `${sizes.medium_large.source_url} 768w`,
		sizes?.large && `${sizes.large.source_url} 1024w`,
		sizes?.full && `${sizes.full.source_url} 1230w`,
	]
		.filter(Boolean)
		.join(", ");

	if (!media || !media.media_details || !media.media_details.sizes) {
		return (
			<div className="w-full h-full flex items-center justify-center">
				No featured image set
			</div>
		);
	} else {
		return (
			<img
				src={
					sizes.medium_large
						? sizes.medium_large.source_url
						: sizes.full.source_url
				}
				srcSet={srcSet}
				sizes="(max-width: 1600px) 100vw, 1600px"
				alt={media.alt_text || "Story Image"}
				className={className}
			/>
		);
	}
}
