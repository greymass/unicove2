<script lang="ts">
	interface Props {
		class?: string;
	}

	const { class: className = '' }: Props = $props();
</script>

<div class="flex items-center justify-center gap-4 py-20 {className}">
	<div class="bounce bounce-1 h-3 w-3 rounded-full bg-white"></div>
	<div class="bounce bounce-2 h-3 w-3 rounded-full bg-white"></div>
	<div class="bounce bounce-3 h-3 w-3 rounded-full bg-white"></div>
</div>

<style>
	@keyframes bounce {
		0%,
		20%,
		50%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-10px);
		}
		60% {
			transform: translateY(-5px);
		}
	}

	.bounce {
		animation: bounce 1.4s infinite ease-in-out;
	}

	.bounce-1 {
		animation-delay: 0s;
	}

	.bounce-2 {
		animation-delay: 0.2s;
	}

	.bounce-3 {
		animation-delay: 0.4s;
	}
</style>
