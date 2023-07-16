<!-- {#if isTopLevel(block, blocks)} -->
<ul id={`_block-${block.id}`} class="notion-list notion-list-todo">
    {#if block.properties}
        <li>
            <!-- <input type="checkbox" disabled checked={isChecked} /> -->
            {#if isChecked}
                <div class="notion-list-item">
                    <div class="notion-list-icon-container">
                        <div class="notion-list-icon">
                            <div class="notion-checkbox checked">
                                <svg viewBox="0 0 14 14"><polygon
                                        points="5.5 11.9993304 14 3.49933039 12.5 2 5.5 8.99933039 1.5 4.9968652 0 6.49933039" /></svg>
                            </div>
                        </div>
                    </div>
                    <span class="notion-checked"><FormattedText
                            {block} /></span>
                </div>
            {:else}
                <div class="notion-list-item">
                    <div class="notion-list-icon-container">
                        <div class="notion-list-icon">
                            <div class="notion-checkbox">
                                <svg
                                    viewBox="0 0 16 16"
                                    class="checkboxSquare"
                                    style="width: 100%; height: 100%; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"><path
                                        d="M1.5,1.5 L1.5,14.5 L14.5,14.5 L14.5,1.5 L1.5,1.5 Z M0,0 L16,0 L16,16 L0,16 L0,0 Z" /></svg>
                            </div>
                        </div>
                    </div>
                    <FormattedText {block} />
                </div>
            {/if}
        </li>
    {/if}
    {#if block.content}
        <ul class="notion-list notion-list-todo">
            <slot />
        </ul>
    {/if}
    <!-- <div class="notion-todo">
    <input type="checkbox" id="{block.id}" name="{block.id}" class="notion-todo-input"> 
    <div class="notion-todo-input-wrapper" for="{block.id}">
      <label class="notion-todo-input-label " for="{block.id}">
        <FormattedText {block} />
      </label>
    </div>
  </div> -->
</ul>
<!-- {:else} -->
<!-- not top level -->
<!-- {#if block.properties}
    <FormattedText {block} />
  {/if}
  {#if block.content}
    <slot />
  {/if} -->

<!-- {/if} -->
<script>
    import { isTopLevel, search } from '../utils.js'
    import FormattedText from '../subcomponents/FormattedText.svelte'
    export let block = {}
    export let blocks = []; blocks;
    export let fullPage = null; fullPage;
    export let api = null; api;

    let isChecked =
        block.properties.checked && block.properties.checked[0] == 'Yes'

</script>

<style>
</style>
