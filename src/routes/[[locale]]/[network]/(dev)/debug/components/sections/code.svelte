<script>
	import { Stack } from '@wharfkit/svelte-components';
	import { Code } from '@wharfkit/svelte-components';
</script>

<Stack id="code">
	<h2 class="text-headline">Code</h2>
	<p>We can use the code component to display JSON snippets. This is useful for debug.</p>
	<p>
		Here we have an inline code snippet: <Code inline>{`{ "key": "value" }`}</Code> surrounded by text.
	</p>
	<p>And here we have a block code snippet:</p>
	<Code>
		{`{
    "key": "value",
    "key2": "someReallyLongValueThatWeCanEitherWrapToTheNextLineOrPresentAScrollbarIfItDoesntFitInThisContainer",
}`}
	</Code>
</Stack>
