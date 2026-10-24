import { Gavel, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ReactNode } from 'react'
import { ThemeToggle } from '#/shared/theme/theme-toggle'
import { Alias } from '#/shared/ui/alias'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/shared/ui/alert-dialog'
import { Badge } from '#/shared/ui/badge'
import { Button } from '#/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/shared/ui/card'
import { CardImage } from '#/shared/ui/card-image'
import { CopyButton } from '#/shared/ui/copy-button'
import { DateTimeInput } from '#/shared/ui/date-time-input'
import { EmptyState } from '#/shared/ui/empty-state'
import { Field } from '#/shared/ui/field'
import { Input } from '#/shared/ui/input'
import { Logo } from '#/shared/ui/logo'
import { MoneyInput } from '#/shared/ui/money-input'
import { Pagination } from '#/shared/ui/pagination'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/shared/ui/select'
import { Skeleton } from '#/shared/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/shared/ui/tabs'

const COLORS = [
  'background',
  'surface',
  'surface-raised',
  'muted',
  'border',
  'border-strong',
  'input',
  'foreground',
  'muted-foreground',
  'subtle-foreground',
  'primary',
  'primary-hover',
  'gold',
  'gold-text',
  'success',
  'warning',
  'danger',
  'info',
  'rarity-common',
  'rarity-uncommon',
  'rarity-rare',
  'rarity-mythic',
  'rarity-special',
]

const TYPE_SCALE = [
  'text-5xl',
  'text-4xl',
  'text-3xl',
  'text-2xl',
  'text-xl',
  'text-lg',
  'text-base',
  'text-sm',
  'text-xs',
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}

/** Living reference of the design system (dev only): tokens and every component state, in both themes. */
export function DesignPage() {
  const [amount, setAmount] = useState<number | null>(123456)
  const [page, setPage] = useState(2)

  return (
    <main className="container-page grid gap-12 py-10">
      <header className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </header>

      <Section title="Cores">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {COLORS.map((name) => (
            <div key={name} className="overflow-hidden rounded-md border">
              <div
                className="h-12"
                style={{ background: `var(--color-${name})` }}
              />
              <p className="bg-surface px-2 py-1.5 font-mono text-xs">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <p className="font-display text-4xl font-bold">
          Fraunces — Lâmina do Dragão Ancestral
        </p>
        <p className="font-mono text-sm">JetBrains Mono — 3fa9c1d2e4b5…</p>
        {TYPE_SCALE.map((size) => (
          <p key={size} className={size}>
            <span className="font-mono text-xs text-subtle-foreground">
              {size}{' '}
            </span>
            Lance atual <Price cents={1234567} className="font-semibold" />
          </p>
        ))}
        <p className="text-muted-foreground">
          Texto secundário (muted-foreground).
        </p>
        <p className="text-subtle-foreground">Legenda (subtle-foreground).</p>
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Dar lance</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Cancelar lote</Button>
          <Button variant="link">Link</Button>
          <Button loading>A enviar</Button>
          <Button disabled>Desativado</Button>
          <Button size="icon" variant="secondary" aria-label="Pesquisar">
            <Search />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">
            <Gavel /> Grande
          </Button>
        </div>
      </Section>

      <Section title="Formulários">
        <div className="grid max-w-md gap-5">
          <Field
            id="ds-email"
            label="E-mail"
            description="Usado para entrar na sua conta."
          >
            <Input type="email" placeholder="ana@exemplo.com" />
          </Field>
          <Field
            id="ds-error"
            label="Nome"
            error="O nome precisa de pelo menos 2 caracteres."
          >
            <Input defaultValue="A" />
          </Field>
          <Field id="ds-money" label="Valor do lance">
            <MoneyInput value={amount} onChange={setAmount} />
          </Field>
          <Field id="ds-date" label="Termina em">
            <DateTimeInput />
          </Field>
          <Field id="ds-select" label="Raridade">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rare">Rara</SelectItem>
                <SelectItem value="mythic">Mítica</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Input disabled placeholder="Desativado" />
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {(
            [
              'neutral',
              'primary',
              'gold',
              'success',
              'warning',
              'danger',
              'info',
            ] as const
          ).map((tone) => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {['common', 'uncommon', 'rare', 'mythic', 'special'].map((rarity) => (
            <RarityBadge key={rarity} rarity={rarity} />
          ))}
          <Alias value="B-3FA9C1D2" />
        </div>
      </Section>

      <Section title="Cards e conteúdo">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Saldo disponível</CardTitle>
              <CardDescription>
                Total menos o comprometido em lances.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Price
                cents={902000}
                className="text-3xl font-semibold text-gold-text"
              />
            </CardContent>
            <CardFooter>
              <Button size="sm">Depositar</Button>
              <CopyButton value="B-3FA9C1D2" />
            </CardFooter>
          </Card>
          <Card className="p-4">
            <CardImage
              src="/catalog/items/00000000-0000-4000-8000-000000000000/image"
              alt="Carta inexistente"
            />
          </Card>
          <Card className="grid gap-3 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        </div>
        <EmptyState
          icon={Gavel}
          title="Nenhum lote ao vivo"
          description="Volte mais tarde ou veja os lotes agendados."
          action={<Button variant="secondary">Ver agendados</Button>}
        />
        <Pagination
          page={page}
          pageSize={20}
          total={95}
          onPageChange={setPage}
        />
      </Section>

      <Section title="Navegação e feedback">
        <Tabs defaultValue="live">
          <TabsList>
            <TabsTrigger value="live">Ao vivo</TabsTrigger>
            <TabsTrigger value="scheduled">Agendados</TabsTrigger>
            <TabsTrigger value="closed">Encerrados</TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="pt-4 text-muted-foreground">
            Conteúdo da aba.
          </TabsContent>
        </Tabs>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => toast.success('Lance enviado!')}
          >
            Toast sucesso
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast.error('Foste superado em R$ 1.250,00')}
          >
            Toast erro
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="danger">Cancelar lote</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar este lote?</AlertDialogTitle>
                <AlertDialogDescription>
                  O licitante que lidera será reembolsado em R$ 1.250,00.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Voltar</AlertDialogCancel>
                <AlertDialogAction variant="danger">
                  Cancelar lote
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Section>
    </main>
  )
}
