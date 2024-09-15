import { ApplicationRef, ComponentRef, ElementRef, EmbeddedViewRef, Injectable, ViewContainerRef } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { TooltipComponent } from './tooltip.component'
import { TooltipPosition } from './tooltip.enums'

@Injectable({ providedIn: 'root' })
export class TooltipService {
  public onlyOneComponentRef = new BehaviorSubject<ComponentRef<any> | null>(null)
  public components$ = this.onlyOneComponentRef.asObservable()

  constructor(private appRef: ApplicationRef, private viewContainerRef: ViewContainerRef) {}

  addComponent(tooltip: any, elementRef: ElementRef, top: number) {
    this.viewContainerRef.clear()
    const componentRef = this.viewContainerRef.createComponent(TooltipComponent)

    const [tooltipDOMElement] = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes
    this.setTooltipComponentProperties(componentRef, tooltip, elementRef, top)
    document.body.appendChild(tooltipDOMElement)
    componentRef.instance.visible = true

    this.onlyOneComponentRef.next(componentRef)
    return componentRef
  }

  remove() {
    this.onlyOneComponentRef.next(null)
  }

  public setTooltipComponentProperties(componentRef: ComponentRef<any>, tooltip: any, elementRef: any, top: number) {
    if (componentRef !== null) {
      componentRef.instance.tooltip = tooltip
      componentRef.instance.position = TooltipPosition.BELOW
      // this.componentRef.instance.id = this.id;

      const { left, right } = elementRef
      const standartTop = top

      componentRef.instance.left = Math.round((right - left) / 2 + left)
      componentRef.instance.top = Math.round(standartTop + 20)
    }
  }

  destroy(component: ComponentRef<any>): void {
    if (component) {
      this.appRef.detachView(component.hostView)
      component.destroy()
      this.onlyOneComponentRef.next(null)
    }
  }
}
