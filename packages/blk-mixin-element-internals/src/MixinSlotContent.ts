import {dedupeMixin} from '@open-wc/dedupe-mixin';

interface CustomElement extends HTMLElement {
  adoptedCallback?(): void;
  attributeChangedCallback?(
    attributeName: string,
    oldValue: unknown,
    newValue: unknown,
    namespace?: string
  ): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

interface CustomElementConstructor {
  new (...params: any[]): HTMLElement & CustomElement;
}

/**
 * Checks if a node's text content contains only whitespace.
 */
const onlyContentWhiteSpace = (nod: Node | null | undefined): boolean =>
  !/[^\t\n\r ]/.test(nod?.textContent ?? '');

/**
 * Checks if a node is a comment node or a text node with only whitespace.
 */
const isIgnorableNode = (nod: Node): boolean =>
  nod.nodeType === Node.COMMENT_NODE ||
  (nod.nodeType === Node.TEXT_NODE && onlyContentWhiteSpace(nod));

const SlotContentBase = <T extends CustomElementConstructor>(Base: T) =>
  class SlotContent extends Base {
    #processSlotContent(slotNode: HTMLSlotElement) {
      const allNodes = [...slotNode.assignedNodes(), ...slotNode.childNodes];
      const nodesWithContent = allNodes
        .filter((nod) => !isIgnorableNode(nod))
        .map((nod) => ({
          flatten: (nod as unknown as {assignedSlot: HTMLSlotElement}).assignedSlot === null,
          assignedNodes: nod.nodeType === Node.TEXT_NODE ? (nod.textContent?.trim() ?? '') : nod,
          assignedSlot: (nod as unknown as {assignedSlot: HTMLSlotElement}).assignedSlot,
        }));

      return {
        assignedContent: nodesWithContent.filter((nod) => nod.flatten === false),
        flattenedContent: nodesWithContent.filter((nod) => nod.flatten === true),
      };
    }

    #createContentStructure(content: unknown[]) {
      return {
        assignedNodesByNode: content,
        assignedNodes: content.map(
          (nod) => (nod as {assignedNodes: HTMLSlotElement | null}).assignedNodes
        ),
      };
    }

    /**
     * @param {Event} ev
     */
    #onSlotChange = (ev: Event) => {
      const slotNode = ev.target as HTMLSlotElement;

      if (slotNode) {
        const contentSlotName = slotNode.name || slotNode.getAttribute('name') || '';
        const originalAssignedNodes = slotNode.assignedNodes({flatten: true});
        const contentSlots = this.#processSlotContent(slotNode);

        const eventDetail = {
          assignedSlotContent: {
            slotName: contentSlotName,
            assignedSlot: contentSlots.assignedContent[0]?.assignedSlot || null,
          },
          assignedNodesContent: this.#createContentStructure(contentSlots.assignedContent),
          flattenedNodesContent: this.#createContentStructure(contentSlots.flattenedContent),
          originalEvent: {
            event: ev,
            assignedNodes: originalAssignedNodes,
          },
        };

        const event = new CustomEvent('slotchanges', {
          composed: true,
          detail: eventDetail,
        });

        this.shadowRoot?.dispatchEvent(event);
      }
    };

    override connectedCallback() {
      super.connectedCallback?.();
      this.shadowRoot?.addEventListener('slotchange', this.#onSlotChange);
    }

    override disconnectedCallback() {
      super.disconnectedCallback?.();
      this.shadowRoot?.removeEventListener('slotchange', this.#onSlotChange);
    }
  };
export const MixinSlotContent = dedupeMixin(SlotContentBase);
